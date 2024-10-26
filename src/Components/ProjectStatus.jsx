import React from 'react';
import { FaCircle } from 'react-icons/fa';

const projects = [
  { name: 'CC-158,', status: 'In Progress', completion: 65 },
  { name: 'CC-188', status: 'On Hold', completion: 30 },
  { name: 'CC-190', status: 'Completed', completion: 100 },
  { name: 'CC-180', status: 'In Progress', completion: 45 },
];

const statusColors = {
  'In Progress': 'text-yellow-500',
  'On Hold': 'text-red-500',
  'Completed': 'text-green-500',
};

function ProjectStatus() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Project Status</h2>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700">{project.name}</p>
              <div className="flex items-center mt-1">
                <FaCircle className={`mr-2 text-xs ${statusColors[project.status]}`} />
                <span className="text-sm text-gray-500">{project.status}</span>
              </div>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${project.completion}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectStatus;