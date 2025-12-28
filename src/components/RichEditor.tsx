'use client'

import React, { useState } from 'react'
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
    const [quillInstance, setQuillInstance] = useState<any>(null)

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
                if (quillInstance) {
                    const range = quillInstance.getSelection(true)
                    quillInstance.insertEmbed(range.index, 'image', result.url)
                    quillInstance.setSelection(range.index + 1)
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
                theme="snow"
                value={value}
                onChange={(content, delta, source, editor) => {
                    onChange(content)
                    // Store quill instance on first render
                    if (!quillInstance) {
                        setQuillInstance(editor)
                    }
                }}
                modules={modules}
                formats={formats}
                style={{ height: '300px', marginBottom: '50px', background: 'white' }}
            />
        </div>
    )
}
