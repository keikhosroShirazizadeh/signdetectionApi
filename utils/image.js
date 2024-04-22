import fs from "fs"
import sharp from "sharp"

async function loadImage(imagePath,width,height){
    const imageBuffer=fs.readFileSync(imagePath)

    const resizedImageBuffer=await sharp(imageBuffer).resize({width,height}).toBuffer()
    
    const metaImage=await sharp(imageBuffer).resize({width,height}).metadata()

    console.log( metaImage);

    const image=new Float32Array(resizedImageBuffer)

    return {buffer:image,metaData:metaImage}
}
async function prepareImage(imagePath){
    const imageBuffer=fs.readFileSync(imagePath)

    const ImageBuffer=sharp(imageBuffer)
    
    const metaImage=await sharp(imageBuffer).metadata()

    // console.log( resizedImageBuffer);

    const [img_width,img_height]=[metaImage.width,metaImage.height]

    const img_channels=metaImage.channels

    const pixels=await ImageBuffer.removeAlpha().resize({width:640,height:640,fit:"fill"}).raw().toBuffer();
    const red=[],green=[],blue=[]
    console.log(pixels.length);
    for(let index=0;index<pixels.length;index+=3){
        red.push(pixels[index]/255.0)
        green.push(pixels[index+1]/255.0)
        blue.push(pixels[index+2]/255.0)
    }
    const input=[...red,...green,...blue]
    return[input,img_width,img_height,img_channels]

    // const image=new Float32Array(resizedImageBuffer)

    // return {buffer:ImageBuffer,metaData:metaImage}
}


// console.log(await loadImage("../test/test.jpg",640,640))

export default{ loadImage,prepareImage}