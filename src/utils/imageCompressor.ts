/**
 * Nén và tối ưu hóa ảnh từ máy ảnh hoặc thư viện thiết bị
 * Giữ trọn vẹn 100% tỉ lệ khung hình (Aspect Ratio), không bóp méo, không cắt mất chi tiết
 * Tối ưu kích thước tệp ~80KB - 180KB với độ sắc nét chuẩn HD
 */
export const compressImage = (file: File, maxDimension = 1600, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Giữ trọn vẹn tỉ lệ ảnh gốc, tỉ lệ lớn nhất thu về maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Khử răng cưa và làm mịn hình ảnh chất lượng cao
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = error => reject(error);
    };
    reader.onerror = error => reject(error);
  });
};
