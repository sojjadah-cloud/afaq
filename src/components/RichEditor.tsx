'use client'

import React, { useRef } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { uploadImage } from '@/actions/upload'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function RichEditor({
    value,
    onChange
}: {
    value: string
    onChange: (val: string) => void
}) {
    const quillRef = useRef<any>(null)

    // Custom image upload handler
    const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return

            try {
                const formData = new FormData()
                formData.append('file', file)

                // Upload image
                const result = await uploadImage(formData)

                if (result.error) {
                    alert(result.error)
                    return
                }

                // Get cursor position and insert image
                const quill = quillRef.current?.getEditor()
                if (quill) {
                    const range = quill.getSelection(true)
                    quill.insertEmbed(range.index, 'image', result.url)
                    quill.setSelection(range.index + 1)
                }
            } catch (error) {
                console.error('Image upload failed:', error)
                alert('Failed to upload image')
            }
        }
    }

    // Custom toolbar modules with image handler
    const modules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ]

    return (
        <div className="rich-editor-wrapper">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                style={{ height: '300px', marginBottom: '50px', background: 'white' }}
            />
        </div>
    )
}
