import "./App.css";

// What-Owe-Future-William-MacAskill/dp/1541618629
// www.amazon.com/What-We-Owe-the-Future/dp/B0B75SSFMZ

export default function App() {
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

      console.log(data);
      return data;
    }

    function extractProductMeta(document: Document) {
      const productSlug = document.URL.split("https://www.amazon.com/")[1];
      const [productId, , variantId] = productSlug.split("/");

      if (productId)
        return {
          url: document.URL,
          productId,
          variantId,
        };
    }

    const metadata = {
      ...extractProductData(document),
      ...extractProductMeta(document),
    };

    console.log(metadata);
  }

  const onClick = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript<string[], void>({
      target: { tabId: tabs[0].id as number },
      func: extractData,
    });
  };

  return (
    <div>
      <h1>Hello There</h1>
      <button onClick={onClick}>clickMe</button>
    </div>
  );
}
