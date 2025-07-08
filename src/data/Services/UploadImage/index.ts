import http from "../axios/index"

// Trả về một string URL thay vì object
export type UploadResponse = string

// Upload single file (trả về URL string)
const uploadSingle = (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return http.post<UploadResponse>("/api/admin/Upload/single", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

// Upload multiple files (trả về mảng URL string)
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
