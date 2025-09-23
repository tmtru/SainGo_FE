import http from "../axios/index"

// Trả về một string URL thay vì object
export type UploadResponse = string


const uploadSingle = (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return http.post<UploadResponse>("/api/admin/Upload/single", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}


const uploadMultiple = (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
        formData.append("files", file)
    })

    return http.post<UploadResponse[]>("/api/admin/Upload/multiple", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

const UploadService = {
    uploadSingle,
    uploadMultiple,
}

export default UploadService
