export default class DataExtractor {
  static extractFromDocument(document: Document) {
    console.log(document)
    const t = document.getElementById("productTitle");
    console.log(t)

    const title = DataExtractor.getTitle(document);
    const description = DataExtractor.getDescription(document); 
    const overview = DataExtractor.getOverview(document);

    console.log(title)

    console.log({
      title,
      description,
      overview
    })
  }

  static getTitle(document: Document) {
    return document.getElementById("productTitle");
  }

  static getDescription(document: Document) {
    return document.getElementById("productDescription")  
  }

  static getOverview(document: Document) {
    return document.getElementById("productOverview_feature_div")
  }
}