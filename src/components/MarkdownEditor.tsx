import React, { useRef, useState, useEffect } from 'react'
import styles from './MarkdownEditor.module.css'
import { uploadImage } from '@/actions/upload'

interface MarkdownEditorProps {
    value?: string
    name: string
    placeholder?: string
    required?: boolean
    className?: string
    maxWords?: number
}

export default function MarkdownEditor({
    value,
    name,
    placeholder,
    required,
    className,
    maxWords
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [wordCount, setWordCount] = useState(0)

    useEffect(() => {
        if (value) {
            const count = value.trim().split(/\s+/).filter(Boolean).length
            setWordCount(count)
        }
    }, [value])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        const count = text.trim().split(/\s+/).filter(Boolean).length
        setWordCount(count)
    }

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const selectedText = text.substring(start, end)

        const newText = text.substring(0, start) +
            before + (selectedText || 'text') + after +
            text.substring(end)

        textarea.value = newText

        // Update word count
        const count = newText.trim().split(/\s+/).filter(Boolean).length
        setWordCount(count)

        textarea.focus()
        textarea.setSelectionRange(start + before.length, end + before.length)
    }

    // Compression Algorithm
    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
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

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.')
            return
        }

        setIsUploading(true)

        try {
            // Compress before upload
            const compressedFile = await compressImage(file)

            const formData = new FormData()
            formData.append('file', compressedFile)

            const result = await uploadImage(formData)

            if (result.error) {
                alert(result.error)
            } else if (result.url) {
                insertText(`\n![${file.name}](${result.url})\n`, '')
            }
        } catch (error) {
            console.error('Compression/Upload error:', error)
            alert('Failed to process image.')
        }

        setIsUploading(false)
    }

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0])
            // Reset input
            e.target.value = ''
        }
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0])
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = () => {
        setIsDragging(false)
    }

    const insertTable = () => {
        insertText(`
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`, '')
    }

    return (
        <div
            className={`${styles.editorWrapper} ${isDragging ? styles.dragging : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <button type="button" onClick={() => insertText('**', '**')} title="Bold">
                        <i className="fa-solid fa-bold"></i>
                    </button>
                    <button type="button" onClick={() => insertText('*', '*')} title="Italic">
                        <i className="fa-solid fa-italic"></i>
                    </button>
                </div>

                <div className={styles.separator}></div>

                <div className={styles.toolGroup}>
                    <button type="button" onClick={() => insertText('# ')} title="H1">H1</button>
                    <button type="button" onClick={() => insertText('## ')} title="H2">H2</button>
                    <button type="button" onClick={() => insertText('### ')} title="H3">H3</button>
                </div>

                <div className={styles.separator}></div>

                <div className={styles.toolGroup}>
                    <button type="button" onClick={() => insertText('- ')} title="Bullet List">
                        <i className="fa-solid fa-list-ul"></i>
                    </button>
                    <button type="button" onClick={() => insertText('1. ')} title="Ordered List">
                        <i className="fa-solid fa-list-ol"></i>
                    </button>
                </div>

                <div className={styles.separator}></div>

                <div className={styles.toolGroup}>
                    <button type="button" onClick={() => fileInputRef.current?.click()} title="Upload Image">
                        <i className="fa-regular fa-image"></i>
                    </button>
                    <button type="button" onClick={() => insertText('[Link Text](url)')} title="Link">
                        <i className="fa-solid fa-link"></i>
                    </button>
                    <button type="button" onClick={insertTable} title="Table">
                        <i className="fa-solid fa-table"></i>
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.hiddenInput}
                    accept="image/*"
                    onChange={onFileChange}
                />

                {isUploading && <span className={styles.uploadingText}>Uploading...</span>}

                {maxWords && (
                    <span className={`${styles.wordCount} ${wordCount > maxWords ? styles.limitReached : ''}`}>
                        {wordCount} / {maxWords} words
                    </span>
                )}
            </div>

            <textarea
                ref={textareaRef}
                name={name}
                defaultValue={value}
                onChange={handleInput}
                placeholder={placeholder || 'Type here... Drag & drop images supported.'}
                required={required}
                className={`${styles.textarea} ${className || ''}`}
                dir="auto"
            ></textarea>

            {isDragging && (
                <div className={styles.dragOverlay}>
                    <i className="fa-solid fa-cloud-upload-alt fa-3x"></i>
                    <p>Drop image to upload</p>
                </div>
            )}
        </div>
    )
}
