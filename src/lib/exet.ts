
// Define the class
export class Extractor {
  document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  extract() {
    console.log("from exet.ts----")
    console.log(this.document.getElementById("productTitle"));
  }
}

// Convert the class to string
const extractorClassString = Extractor.toString();
export default extractorClassString;