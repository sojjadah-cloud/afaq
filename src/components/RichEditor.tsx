'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function RichEditor({
    value,
    onChange
}: {
    value: string
    onChange: (val: string) => void
}) {
    // Custom toolbar modules
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
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
                onChange={onChange}
                modules={modules}
                formats={formats}
                style={{ height: '300px', marginBottom: '50px', background: 'white' }}
            />
        </div>
    )
}
