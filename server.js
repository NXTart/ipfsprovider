const express = require('express')
const cors = require('cors');
const formidable = require('formidable');
const fs = require("fs");
const FormData = require("form-data");
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('567b3bda3810c0d7364f', 'efd2fe3e5683679c6b8b9a6c49d2f0a966a04586d2924a4e687d7a31243a5c75');

const app = express()
const port = 3000


app.use(cors());

app.get('/', (request, response) => {
    response.send('IPFS Provider is started')
})

const testAuthentication = () => {
   pinata.testAuthentication().then((result) => {
    //handle successful authentication here
    console.log(result);
  }).catch((err) => {
    //handle error here
    console.log(err);
  });
}

const testUpload = () => {
  const fs = require('fs');
  const readableStreamForFile = fs.createReadStream('./img/answer_21_1.jpg');
  const options = {
     pinataMetadata: {
         name: 'answer_21_1.jpg',
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
     },
     pinataOptions: {
        cidVersion: 0
     }
  };
  pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });
}

const uploadIPFS = (path, metaData) => {
  const fs = require('fs');
  const readableStreamForFile = fs.createReadStream(path);
  const options = {
     pinataMetadata: metaData,
     pinataOptions: {
        cidVersion: 0
     }
  };
  return pinata.pinFileToIPFS(readableStreamForFile, options);
}

const setMetaDataIPFS = (data) => {

//  const body = data;
  const dataJson = JSON.parse(data);

   const options = {
      pinataMetadata: {
        name: dataJson.name,
      },
      pinataOptions: {
         cidVersion: 0
      }
   };
   return pinata.pinJSONToIPFS(dataJson, options);
}



app.get('/test', (request, response) => {
   testAuthentication();
   response.send('IPFS Provider is started');
})
app.get('/test_upload', (request, response) => {
   testUpload();
   response.send('Upload test');
})


function getFilePath(req) {
    var form = new formidable.IncomingForm();
    return new Promise(function (resolve, reject) {
        form.parse(req, function (err, fields, files) {
            resolve({path: files.image.path, name: files.image.name});
        }); 
    });
}

app.post('/upload', (request, response) => {

  return getFilePath(request)
         .then((file)=>{
            return uploadIPFS(file.path, 
               {
                 name: file.name
               }
            );
         })  
         .then((data)=>{
            response.json(data);
         })  
         .catch((err)=>{
            return console.log('something bad happened in upload', err)
            response.json({ IpfsHash:'', PinSize: 0, Timestamp:''});
         });
});

function getMetaData(req) {
    var form = new formidable.IncomingForm();
    return new Promise(function (resolve, reject) {
        form.parse(req, function (err, fields, files) {
            resolve(fields.data);
        }); 
    });
}

app.post('/setmetadata', (request, response) => {
    console.log(request.query.data);
  return getMetaData(request)
         .then((data)=>{
            return setMetaDataIPFS(data);
         })
         .then((data)=>{
            response.json(data);
         })  
         .catch((err)=>{
            return console.log('something bad happened in set metadata', err)
            response.json({ IpfsHash:'', PinSize: 0, Timestamp:''});
         });
});


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
