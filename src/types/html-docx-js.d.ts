declare module "html-docx-js/dist/html-docx" {
  const htmlDocx: {
    asBlob: (html: string, options?: any) => Blob;
    asArrayBuffer: (html: string, options?: any) => ArrayBuffer;
  };
  export default htmlDocx;
}
