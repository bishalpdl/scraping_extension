
interface IPostData {
  url: string;
  productSlug: string;
  variantId: string;
  title: string;
  description?: string;
  price?: number;
}

export const submitData=async(data: IPostData)=>{
  console.log("data to be submitted")
  console.log(data)

  await fetch("http://localhost:8080/api/v1/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })
}