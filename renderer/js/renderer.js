const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
  const file = e.target.files[0];

  if (!checkImageType(file)) {
    showToastAlert('Please upload image file');
    return;
  }

  //Get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    widthInput.value = image.width;
    heightInput.value = image.height;
  }

  form.style.display = 'block';
  filename.innerHTML = file.name;
  outputPath.innerHTML = path.join(os.homedir(), 'imageresizer');
  
}

//Send image data to main process
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if(!img.files[0]) {
    showToastAlert('Please upload image file')
    return;
  }

  if(width == '' || height == '') {
    showToastAlert('Enter height and width to resize image');
    return;
  }

  //send to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  });
}

//catch the done event
ipcRenderer.on('image:done', () => {
  showToastSuccess(`Image have been resized to ${widthInput.value} x ${heightInput.value}`)
})

//Check Image Type
function checkImageType(file) {
  const acceptedImageType = ['image/gif', 'image/png', 'image/PNG', 'image/jpeg', 'image/JPEG', 'image/jpg', 'image/JPG'];
  return file && acceptedImageType.includes(file.type);
}

//Show Error Toast
function showToastAlert(message) {
  toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      backgroundColor: 'red',
      color: 'white',
      textAlign: 'center',
    }
  });
}

//Show Success Toast
function showToastSuccess(message) {
  toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      backgroundColor: 'green',
      color: 'white',
      textAlign: 'center',
    }
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);