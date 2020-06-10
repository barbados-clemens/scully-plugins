
// TODO why did I have to use axios instead of my own request??
import axios from 'axios';
import sharp from 'sharp'

async function download(url: string) {
  console.log('downloading')
  return axios.get(url, {responseType: "arraybuffer"})
}

async function resize(data: Buffer) {
  console.log('resizing')
  return sharp(data)
    .resize(20)
    .toBuffer()
}

function toBase64(data: Buffer): string {
  console.log('making base 64 image')
  return Buffer.from(data).toString('base64');
}

async function getImgPadding(data: Buffer) {
  console.log('getting metadata');
  const {height, width} = await sharp(data)
    .metadata();
  return (height / width) * 100;
}

interface IAstData {
  paddingBottom: number;
  b64: string;
  caption: string
  imgUrl: string;
}

function buildAst({paddingBottom, b64, caption, imgUrl}: IAstData) {
  const markup = {
    tagName: 'span',
    props: {
      class: 'img-wrapper',
      style: `padding-bottom: ${paddingBottom}%;
             position: relative;
             bottom: 0;
             left: 0;
             display: block;
             background-size: cover;
             background-image: url('data:image/png;base64,${b64}');`
    },
    children: [
      {
        tagName: 'img',
        props: {
          class: 'img-sharp',
          src: `data:image/png;base64,${b64}`,
          alt: `${caption}`,
          title: `${caption}`,
          srcset: `${imgUrl}`,
          sizes: '1080',
          style: `width: 100%;
                  height: 100%;
                  margin: 0;
                  vertical-align: middle;
                  position: absolute;
                  top: 0;
                  left: 0;`,
        }
      }
    ]
  }
  return markup;
}


export async function newImgMarkUp(imgUrl: string, caption: string) {

  const {data} = await download(imgUrl)

  if (!data) {
    throw Error('no image found')
  }

  const resized = await resize(data);

  const b64 = toBase64(resized);

  const paddingBottom = await getImgPadding(resized);

  return buildAst({b64, paddingBottom, caption, imgUrl})

}

