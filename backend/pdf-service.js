const PDFDocument = require("pdfkit");

function buildPDF(content, newData, dataCallback, endCallback) {
  const doc = new PDFDocument({
    bufferPages: true,
    margins: { top: 30, bottom: 30, left: 30, right: 30 },
  });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  // Učitajte prilagođeni font koji podržava srpsku latinicu
  doc.registerFont(
    "OpenSans_Condensed-Regular",
    "./fonts/OpenSans_Condensed-Regular.ttf"
  );

  // Naslov na prvoj stranici
  doc
    .font("OpenSans_Condensed-Regular")
    .fillColor("#333333")
    .fontSize(24)
    .text("Nutricionistički plan ishrane", { align: "center", underline: true });
  doc.moveDown(2);

  // Parsiramo `content` u sekcije na osnovu obrazaca
  const sections = content.split("\n\n");

  // Lista obroka iz `newData.ucestBr`, razdvojena po zarezima
  const mealsToInclude = newData.ucestBr.split(", ").map((meal) => meal.toLowerCase());

  sections.forEach((section) => {
    if (section.startsWith("Nutricionistički opis") || section.startsWith("Nutritivni opis") || section.startsWith("Nutristički opis")) {
      const introTitle = section.split("\n")[0];
      const introText = section.split("\n").slice(1).join("\n");

      doc
        .font("OpenSans_Condensed-Regular")
        .fillColor("#333333")
        .fontSize(20)
        .text(introTitle, { align: "justify" });
      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor("#000000")
        .text(introText, { align: "justify" });
      doc.moveDown();
    } else if (/^(\*{0,2}Dan \d+\*{0,2}:)/.test(section)) {
      doc.addPage();

      const [dayTitleRaw, ...meals] = section.split("\n");
      const dayTitle = dayTitleRaw.replace(/^\*{0,2}(Dan \d+)\*{0,2}:/, "$1:");

      doc
        .font("OpenSans_Condensed-Regular")
        .fillColor("#333333")
        .fontSize(16)
        .text(dayTitle, { align: "left" });
      doc.moveDown(0.5);

      meals.forEach((meal) => {
        const lines = meal.split("\n  - ");
        const mealHeader = lines[0];
        const additionalInfo = lines.slice(1);

        const mealType = mealHeader.split(":")[0].trim().toLowerCase();
        if (mealsToInclude.includes(mealType)) {
          doc
            .font("OpenSans_Condensed-Regular")
            .fillColor("#000000")
            .fontSize(12)
            .text(`- ${mealHeader}`, { align: "left", indent: 20 });
          doc.moveDown(0.3);

          additionalInfo.forEach((info) => {
            doc
              .font("OpenSans_Condensed-Regular")
              .fillColor("#555555")
              .fontSize(10)
              .text(`  - ${info}`, { align: "left", indent: 40 });
            doc.moveDown(0.2);
          });
        }
      });

      doc.moveDown(1);
    } else if (section.startsWith("Zaključak")) {
      doc.addPage();
      doc
        .font("OpenSans_Condensed-Regular")
        .fillColor("#333333")
        .fontSize(20)
        .text("Zaključak", { underline: true });
      doc.moveDown();
      
      const conclusionText = section.replace("Zaključak\n", "");
      doc
        .fontSize(12)
        .fillColor("#000000")
        .text(conclusionText, { align: "justify" });
    }
  });

  // Dodavanje brojeva stranica na sve stranice sa sadržajem
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);

    const oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .fontSize(10)
      .fillColor("#333333")
      .text(
        `Strana ${i + 1} od ${pages.count}`,
        0,
        doc.page.height - oldBottomMargin - 15,
        { align: "center" }
      );
    doc.page.margins.bottom = oldBottomMargin;
  }

  doc.end();
}

module.exports = { buildPDF };
