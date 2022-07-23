import { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

export const baseStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  borderWidth: 2,
  borderColor: '#FF00BF',
  borderStyle: 'dashed',
  borderRadius: '10px',
  color: '#8f8f8f',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

export const focusedStyle = {
  borderColor: '#2196f3',
};

export const acceptStyle = {
  borderColor: '#00e676',
};

export const rejectStyle = {
  borderColor: '#838383',
};

export default function DragAndDrop({
  handleFilesChange,
  width = false,
  id,
  name,
  placeholder = "Drag 'n' drop some files here, or click to select files",
}) {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    isDragActive,
  } = useDropzone({
    // accept: 'audio/*',
    onDrop: (acceptedFiles) => handleFilesChange(acceptedFiles, id),
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <section
      {...getRootProps({ style })}
      className={`${
        width === 0 ? 'w-1/2' : 'w-full'
      }  h-14 border border-red-300 gap-4 px-3 py-2 text-sm shadow-md `}
    >
      <div>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files/folders here ...</p>
        ) : (
          <p>{placeholder}</p>
        )}
      </div>
    </section>
  );
}
