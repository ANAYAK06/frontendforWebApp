// components/ClientBOQ/DraggableColumn.jsx
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const DraggableColumn = ({ column, index, moveColumn }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'COLUMN',
        item: { index },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    const [, drop] = useDrop({
        accept: 'COLUMN',
        hover(item) {
            if (item.index !== index) {
                moveColumn(item.index, index);
                item.index = index;
            }
        }
    });

    return (
        <th
            ref={node => drag(drop(node))}
            className={`px-4 py-2 border cursor-move ${isDragging ? 'opacity-50 bg-gray-100' : ''}`}
        >
            {column.label}
        </th>
    );
};

export default DraggableColumn;