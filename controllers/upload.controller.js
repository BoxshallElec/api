const s3BrowserDirectUpload = require("s3-browser-direct-upload");
const AWS = require("aws-sdk");
const config = require("config");
const awsConfig = config.get("aws");
AWS.config.update({
    accessKeyId: awsConfig.accessKey,
    secretAccessKey: awsConfig.secretKey,
    region: awsConfig.region,
});
exports.getSignedUrls = function (req, res) {
    try {
        let { imageNames } = req.body;
        let s3clientOptions = {
            accessKeyId: awsConfig.accessKey, // required
            secretAccessKey: awsConfig.secretKey,
            region: awsConfig.region,
            signatureVersion: "v4", // optional
        };
        let s3client = new s3BrowserDirectUpload(s3clientOptions); // allowedTypes is optional
        let uploadKeys = [];
        for (let i = 0; i < imageNames.length; i++) {
            let name = imageNames[i];
            let uploadPostFormOptions = {
                key: name, // "filename.ext", // required
                bucket: awsConfig.bucket,
                region: awsConfig.region,
            };
            s3client.uploadPostForm(uploadPostFormOptions, function (err, params) {
                if (err) throw err;
                uploadKeys.push(params);
            });
        }
        return res.status(200).json({
            success: true,
            message: "signed urls",
            data: uploadKeys
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

exports.deleteFilesFromAWS = function (req, res) {

    try {
        let images = req.body.fileUrls
        let paths = [];
        paths = images.map(d => {
            return { Key: d };
        });
        let s3 = new AWS.S3();
        const newThis = this;
        s3.deleteObjects(
            {
                Bucket: awsConfig.bucket,
                Delete: {
                    Objects: paths,
                },
            }, (err, data) => {
                try {
                    if (err) throw err;
                    return res.status(200).json({
                        success: true,
                        message: "files deleted successfully"
                    });
                } catch (error) {
                    return res.status(500).json({ success: false, message: error.message });
                }
            }
        )
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

