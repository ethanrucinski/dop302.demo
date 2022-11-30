const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

exports.handler = async(event, _) => {
    // retrieve inputs
    let body, key, content;
    try {
        body = JSON.parse(event.body);
        key = body.key;
        content = body.content;
    } catch (err) {
        return {
            error: `Could not parse input ${err}`
        }
    }

    try {
        const clientS3 = new S3Client();
        const  command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Body: content,
            Key: key
        })
        const result = await clientS3.send(command);
        return result;        
    } catch (err) {
        return {
            error: `Could not put object ${err}`,
        };
    }
}