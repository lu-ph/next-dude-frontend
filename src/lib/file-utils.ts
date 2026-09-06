export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(`Failed to read ${file.name}`))
        return
      }

      resolve(reader.result.split(",")[1] || reader.result)
    }
    reader.onerror = () => reject(reader.error || new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })

export const filesToBase64 = async (files: File[]) =>
  Promise.all(files.map(fileToBase64))
