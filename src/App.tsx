import { useEffect, useState } from "react";
import "./App.css";

// What-Owe-Future-William-MacAskill/dp/1541618629
// www.amazon.com/What-We-Owe-the-Future/dp/B0B75SSFMZ

interface IPostData {
  url: string;
  productSlug: string;
  variantId: string;
  title: string;
  description?: string;
  price?: number;
  images: string[];
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  }, [isLoading]);

  function extractData() {
    function extractTextFromNested(element: Node): string {
      let text = "";

      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent ?? "";
        }

        // If it's an element node, recursively call extractText on it
        else if (node.nodeType === Node.ELEMENT_NODE) {
          text += extractTextFromNested(node);
        }
      });

      return text;
    }

    function extractProductData(document: Document) {
      let price = undefined;
      const pricesElement = document.getElementsByClassName("apexPriceToPay");
      console.log(pricesElement);

      if (pricesElement.length > 1) {
        alert(
          "multiple price points found. Please be specific and choose a product option."
        );
        throw new Error(
          "multiple price points found. Please be specific and choose a product option."
        );
      } else {
        price =
          pricesElement?.[0]?.querySelector("span.a-offscreen")?.innerHTML;
      }

      if (!price) {
        let priceToPayElement = document.querySelector(".priceToPay");

        if (priceToPayElement) {
          let pricePoint = (priceToPayElement as any).innerText
            .split("\n")
            .join("");
          if (pricePoint) {
            price = pricePoint;
          }
        }
      }

      if (price) {
        if (!/^\$\d{1,3}(,\d{3})*(\.\d{2})?$/.test(price)) {
          alert("value must be in usd. Other currency is not implemented.");
          throw new Error(
            "value must be in usd. Other currency is not implemented."
          );
        }
      }

      const data = {
        title: document.getElementById("productTitle")?.innerText,
        description: document.getElementById("productDescription")
          ? extractTextFromNested(
              document.getElementById("productDescription") as Node
            )
          : null,
        price,
      };

      return data;
    }

    function extractImages(document: Document) {
      const imagesThumbnails = document.querySelectorAll(".imageThumbnail");
      const images = [];
      for (let i = 0; i < imagesThumbnails.length; i++) {
        let src = imagesThumbnails?.[i].querySelector("img")?.src;
        if (src) {
          if (src.includes("_AC_SR")) {
            let regex = /_AC_SR\d+,\d+_/;
            let newDimensions = "500,500";
            src = src.replace(regex, "_AC_SR" + newDimensions + "_");
          } else if (src.includes("_AC_US")) {
            let regex = /_AC_US\d+_/;
            let newParams = "500"; // Example: Replace with your desired parameters
            src = src.replace(regex, "_AC_US" + newParams + "_");
          }
        }

        images.push(src);
      }

      return { images };
    }

    function extractProductMeta(document: Document) {
      const validAmazonProductDetailPagePattern =
        /https?:\/\/(www\.)?amazon\.com\/[^\/]+\/dp\/[A-Z0-9]{10}(\/|\?|$)/;

      if (!validAmazonProductDetailPagePattern.test(document.URL)) {
        alert("Not a valid amazon.com product detail page.");
        return;
      }

      const productSlug = document.URL.split("https://www.amazon.com/")[1];
      const [productId, , variantId] = productSlug.split("/");

      if (productId)
        return {
          url: document.URL,
          productId,
          variantId,
        };
    }

    function prepareDataForApi(data: any) {
      if (!data.url || !data.productId || !data.variantId || !data.title) {
        alert("Not suffient data found.");
      }

      const refinedData = {
        url: data.url,
        productSlug: data.productId,
        variantId: data.variantId,
        title: data.title,
        price: data?.price,
        description: data?.description,
        images: data?.images ?? [],
      };

      if (refinedData.price && refinedData.price?.split("$")?.[1]) {
        const justNumericPrice = refinedData.price
          .split("$")[1]
          .replace(/,/g, "");
        refinedData.price = parseFloat(justNumericPrice);
      }

      console.log(refinedData);

      submitData(refinedData);
    }

    const submitData = (data: IPostData) => {
      console.log("data to be submitted");
      console.log(data);

      fetch("http://localhost:8080/api/v1/public/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(() => {
          alert("Successfully scrape the site.");
        })
        .catch((e: any) => {
          console.log(e);
          alert("Failed to scrape the site. Please try again later.");
        });
    };

    const productData = {
      ...extractProductData(document),
      ...extractProductMeta(document),
      ...extractImages(document),
    };

    console.log(extractImages(document));

    console.log(productData);
    prepareDataForApi(productData);
  }

  const onClick = async () => {
    setIsLoading(true);
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tabs[0].id as number },
      func: extractData,
    });
  };

  return (
    <div style={{ width: "300px", padding: "20px" }}>
      <h2>Amazon scraper</h2>

      <p style={{ fontWeight: 600 }}>
        Only works in amazon.com website for now.
      </p>

      <button disabled={isLoading} onClick={onClick}>
        {isLoading ? "Sending data" : "Scrape Data"}
      </button>
    </div>
  );
}
