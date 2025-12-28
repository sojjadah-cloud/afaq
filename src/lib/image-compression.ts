export const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        // If not an image, return original file
        if (!file.type.startsWith('image/')) {
            resolve(file)
            return
        }

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')

                // Max dimensions (e.g., 1920x1080)
                const MAX_WIDTH = 1920
                const MAX_HEIGHT = 1080
                let width = img.width
                let height = img.height

                // Resize logic
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Canvas context not available'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                // Compress to JPEG with 0.8 quality
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'))
                        return
                    }
                    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    })
                    resolve(compressedFile)
                }, 'image/jpeg', 0.8) // 80% quality
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}
