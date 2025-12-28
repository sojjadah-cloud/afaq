import React from 'react'

export function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null

    // Helper to process lines
    const processContent = (text: string) => {
        const lines = text.split('\n')
        const elements: React.ReactNode[] = []
        let inTable = false
        let tableRows: string[][] = []

        const renderTable = (rows: string[][], index: number) => {
            if (rows.length < 2) return null
            const [header, separator, ...body] = rows

            return (
                <div key={`table-${index}`} className="md-table-wrapper">
                    <table className="md-table">
                        <thead>
                            <tr>
                                {header.map((cell, i) => (
                                    <th key={i}>{cell.trim()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {body.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td key={j}>{cell.trim()}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Image: ![alt](url =WxH) regex
            // Supports: ![alt](url), ![alt](url =300), ![alt](url =300x200), ![alt](url =50%)
            const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)(?:\s+=(\d+(?:px|%|vh|vw|)|auto)(?:x(\d+(?:px|%|vh|vw|)|auto))?)?\)$/)

            if (imgMatch) {
                const alt = imgMatch[1]
                let src = imgMatch[2].trim()
                const width = imgMatch[3]
                const height = imgMatch[4]

                // Sanitize src
                if (!src.startsWith('http') && !src.startsWith('/')) {
                    src = ''
                }

                const style: React.CSSProperties = {
                    maxWidth: '100%' // Always enforce max-width constraint
                }
                if (width) style.width = width.match(/^\d+$/) ? `${width}px` : width
                if (height) style.height = height.match(/^\d+$/) ? `${height}px` : height

                elements.push(
                    <div key={i} className="md-image-wrapper">
                        <img
                            src={src}
                            alt={alt}
                            className="md-image"
                            style={style}
                        />
                    </div>
                )
                continue
            }

            // Headers
            if (line.startsWith('# ')) {
                elements.push(<h1 key={i}>{processInline(line.substring(2))}</h1>)
                continue
            }
            if (line.startsWith('## ')) {
                elements.push(<h2 key={i}>{processInline(line.substring(3))}</h2>)
                continue
            }
            if (line.startsWith('### ')) {
                elements.push(<h3 key={i}>{processInline(line.substring(4))}</h3>)
                continue
            }

            // List Item
            if (line.startsWith('- ')) {
                elements.push(<li key={i}>{processInline(line.substring(2))}</li>)
                continue
            }

            // Table Detection
            if (line.trim().startsWith('|')) {
                const cells = line.split('|').filter(c => c.trim() !== '') // naive split
                if (cells.length > 0) {
                    if (!inTable) {
                        inTable = true
                        tableRows = []
                    }
                    tableRows.push(cells)
                    continue
                }
            }

            // End of table
            if (inTable && !line.trim().startsWith('|')) {
                inTable = false
                elements.push(renderTable(tableRows, i))
                tableRows = []
            }

            // Default Paragraph (handle empty lines as break or skip)
            if (line.trim() === '') {
                elements.push(<br key={i} />)
            } else {
                // Check if previous was list item URL
                elements.push(<p key={i}>{processInline(line)}</p>)
            }
        }

        // flush table if ended at EOF
        if (inTable) {
            // @ts-ignore
            elements.push(renderTable(tableRows, lines.length))
        }

        return elements
    }

    // Naive inline processor for Bold, Italic, Link
    const processInline = (text: string): React.ReactNode => {
        // Split by simple regex tokens
        // TODO: This is very basic. For full markdown use a library.
        // Handling **Bold**
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.substring(2, part.length - 2)}</strong>
            }
            // Links [text](url) - Regex is tricky in split, let's just return text for now or simple replace
            // Improve link support if requested
            return part
        })
    }

    return <div className="markdown-content">{processContent(content)}</div>
}
