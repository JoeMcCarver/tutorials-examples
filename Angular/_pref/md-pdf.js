var markdownpdf = require("markdown-pdf"),
  path = require('path');
  source = path.join(__dirname, 'npmCheatSheet.md'),
  destination = path.join(__dirname, 'npmCheatSheet.pdf');

markdownpdf()
  .from(source)
  .to(destination, function () {
    console.log("Done")
  });
