import { v2 as cloudinary } from 'cloudinary';
import { config } from '../configs/config.js';
import fs from 'fs/promises';

// aqui desactivo la verificacion SSL para evitar errores de conexion con cloudinary u otros servicios
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// aqui configuro cloudinary usando los datos que estan en el config
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (filePath, fileName) => {
  try {
    const folder = config.cloudinary.folder;
    
    // aqui normalizo la ruta del archivo
    // cambio las barras invertidas por barras normales para evitar errores en la subida
    const normalizedFilePath = filePath.replace(/\\/g, '/');
    
    // aqui le quito la extension al nombre del archivo para usarlo como public_id
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    const options = {
      public_id: fileNameWithoutExt,
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    const result = await cloudinary.uploader.upload(normalizedFilePath, options);

    // aqui elimino el archivo local despues de subirlo correctamente
    try {
      await fs.unlink(normalizedFilePath);
    } catch {
      console.warn('Warning: Could not delete local file:', normalizedFilePath);
    }

    if (result.error) {
      throw new Error(`Error uploading image: ${result.error.message}`);
    }

    // aqui retorno la url completa que cloudinary genera para la imagen
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error?.message || error);

    try {
      await fs.unlink(filePath);
    } catch {
      console.warn('Warning: Could not delete local file after upload error');
    }

    throw new Error(
      `Failed to upload image to Cloudinary: ${error?.message || ''}`
    );
  }
};

export const deleteImage = async (imagePath) => {
  try {
    // aqui verifico que exista la imagen y que no sea el avatar por defecto
    if (!imagePath || imagePath === config.cloudinary.defaultAvatarPath) {
      return true;
    }

    const folder = config.cloudinary.folder;
    
    // aqui reviso si imagePath es una url completa
    let publicId;
    if (imagePath.includes('cloudinary.com')) {
      // aqui extraigo el public_id desde la url
      const urlParts = imagePath.split('/upload/');
      if (urlParts.length > 1) {
        const pathAfterUpload = urlParts[1];
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
        publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
      } else {
        publicId = imagePath;
      }
    } else {
      // si no es url entonces asumo que es el nombre del archivo
      publicId = imagePath.includes('/')
        ? imagePath
        : `${folder}/${imagePath}`;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);

    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return getDefaultAvatarUrl();
  }

  // si ya es una url completa de cloudinary solo la retorno
  if (
    imagePath.startsWith('https://res.cloudinary.com/') ||
    imagePath.startsWith('http://res.cloudinary.com/')
  ) {
    return imagePath;
  }

  // si no es una url completa entonces la construyo manualmente
  const baseUrl =
    config.cloudinary.baseUrl ||
    `https://res.cloudinary.com/${config.cloudinary.cloudName}/image/upload/`;

  const folder = config.cloudinary.folder;

  const pathToUse = !imagePath
    ? config.cloudinary.defaultAvatarPath
    : imagePath.includes('/')
    ? imagePath
    : `${folder}/${imagePath}`;

  return `${baseUrl}${pathToUse}`;
};

export const getDefaultAvatarUrl = () => {
  const defaultPath = config.cloudinary.defaultAvatarPath;
  return getFullImageUrl(defaultPath);
};

export const getDefaultAvatarPath = () => {
  const defaultPath = config.cloudinary.defaultAvatarPath;

  // aqui verifico si dotenv no expandio bien las variables del path
  if (defaultPath && defaultPath.includes('${')) {
    const folder = process.env.CLOUDINARY_FOLDER;
    const filename = process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME;
    if (folder || filename) {
      return [folder, filename].filter(Boolean).join('/');
    }
  }

  if (defaultPath && defaultPath.includes('/')) {
    return defaultPath.split('/').pop();
  }

  return defaultPath;
};

export default {
  uploadImage,
  deleteImage,
  getFullImageUrl,
  getDefaultAvatarUrl,
  getDefaultAvatarPath,
};