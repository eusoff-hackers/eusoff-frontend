import React from "react";

export interface ProfileTableProps {
  tabledata: ProfileTableItems[];
}

export interface ProfileTableItems {
  title: string;
  value: string;
}

const ProfileTable: React.FC<ProfileTableProps> = ({ tabledata }) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border-2 border-indigo-950">
      <table className="w-full divide-y divide-gray-400 shadow">
        <tbody className="divide-y divide-gray-400">
          {tabledata.map((data, key) => (
            <tr key={key}>
              <td className="whitespace-nowrap px-6 py-4 text-base font-bold text-gray-800">{data.title}</td>
              <td className="whitespace-nowrap px-6 py-4 text-base text-gray-800">{data.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileTable;
