
import imageutils from "./image.js"
import path from "path"
import ort from "onnxruntime-node"
const __dirname=process.cwd()
const yolo_classes = [
    'sign',
];
async function detect_sign(filename){
    // console.log("current directory: ",process.cwd());
    const session =await ort.InferenceSession.create(path.join(__dirname,"./utils/best.onnx"))
    const [image,width,height,channels]=await imageutils.prepareImage(path.join(__dirname,"/public/uploads",filename))
    const input=new ort.Tensor(Float32Array.from(image),[1,channels,640,640])
    const output=await session.run({images:input})
    console.log("output data: ",output["output0"].data)
    const result=process_output(output["output0"].data,width,height)
    console.log("result: ",result);
    return result
    // const tensorA=new ort.Tensor(image,[])
    // const feeds={images:tensorA}
    // const result=await session.run(feeds)
    // const dataC=result.c.data
    // console.log(`data of the result tensor: 'c'  ${dataC}`);
}
/**
 * Function calculates "Intersection-over-union" coefficient for specified two boxes
 * https://pyimagesearch.com/2016/11/07/intersection-over-union-iou-for-object-detection/.
 * @param box1 First box in format: [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format: [x1,y1,x2,y2,object_class,probability]
 * @returns Intersection over union ratio as a float number
 */
function iou(box1,box2) {
    return intersection(box1,box2)/union(box1,box2);
}
/**
 * Function calculates union area of two boxes.
 *     :param box1: First box in format [x1,y1,x2,y2,object_class,probability]
 *     :param box2: Second box in format [x1,y1,x2,y2,object_class,probability]
 *     :return: Area of the boxes union as a float number
 * @param box1 First box in format [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format [x1,y1,x2,y2,object_class,probability]
 * @returns Area of the boxes union as a float number
 */
function union(box1,box2) {
    const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
    const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
    const box1_area = (box1_x2-box1_x1)*(box1_y2-box1_y1)
    const box2_area = (box2_x2-box2_x1)*(box2_y2-box2_y1)
    return box1_area + box2_area - intersection(box1,box2)
}

/**
 * Function calculates intersection area of two boxes
 * @param box1 First box in format [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format [x1,y1,x2,y2,object_class,probability]
 * @returns Area of intersection of the boxes as a float number
 */
function intersection(box1,box2) {
    const [box1_x1,box1_y1,box1_x2,box1_y2] = box1;
    const [box2_x1,box2_y1,box2_x2,box2_y2] = box2;
    const x1 = Math.max(box1_x1,box2_x1);
    const y1 = Math.max(box1_y1,box2_y1);
    const x2 = Math.min(box1_x2,box2_x2);
    const y2 = Math.min(box1_y2,box2_y2);
    return (x2-x1)*(y2-y1)
}

function process_output(output, img_width, img_height) {
    let boxes = [];
    for (let index=0;index<8400;index++) {
        const [class_id,prob] = [...Array(80).keys()]
            .map(col => [col, output[8400*(col+4)+index]])
            .reduce((accum, item) => item[1]>accum[1] ? item : accum,[0,0]);
        if (prob < 0.5) {
            continue;
        }
        const label = yolo_classes[class_id];
        const xc = output[index];
        const yc = output[8400+index];
        const w = output[2*8400+index];
        const h = output[3*8400+index];
        const x1 = (xc-w/2)/640*img_width;
        const y1 = (yc-h/2)/640*img_height;
        const x2 = (xc+w/2)/640*img_width;
        const y2 = (yc+h/2)/640*img_height;
        boxes.push([x1,y1,x2,y2,label,prob]);
    }

    boxes = boxes.sort((box1,box2) => box2[5]-box1[5])
    const result = [];
    while (boxes.length>0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0],box)<0.7);
    }
    return result;
}



async function loadModel(modelPath) {
    const session=new onnx.InferenceSession()
    await session.loadModel(modelPath)
    return session
}

// async function detectObjects(model,inputImageData){
//     // Convert input image data to tensor
//     const input = new Tensor(new Float32Array(inputImageData), 'float32', [1, height, width, channels]);

//     // Run inference
//     const outputMap = await model.run([input]);

//     // Process the output
//     const outputTensor = outputMap.values().next().value;
//     const outputData = outputTensor.data;

//     // Process the output data as per your model's output format
//     // For example, extract bounding boxes, confidence scores, etc.
//     // Return the detected objects
//     return detectedObjects;
// }
// const modelPath = 'model/best.onnx';
// const imagePath = 'test/test.jpg';
// const width = 640; // Adjust according to your model's input size
// const height = 640; // Adjust according to your model's input size
// (async () => {
//     const model = await loadModel(modelPath);
//     const imageData = await imageutils.loadImage(imagePath, width, height);
//     const detectedObjects = await detectObjects(model, imageData);
//     console.log(detectedObjects);
// })();


// main()
export default{detect_sign}


