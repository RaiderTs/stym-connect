import Create from '../../components/svg/create.svg';

export default function CreateFileButton({
  openFileDialog,
  handleFilesChange,
  name,
  id,
  width,
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-10'>
      {/* <span className='text-3xl font-medium'>
        You don&apos;t have tracks in this stym yet click the button to add
        tracks
      </span> */}

      <label
        // * if there's no files in folder then cut the width by half otherwise - full width
        className={`${
          width ? 'w-1/2 mr-auto' : 'w-full '
        } flex items-center justify-center shadow-md p-3 border cursor-pointer border-my-light-purple rounded-10`}
      >
        <div onClick={openFileDialog}>
          <Create className='w-8' />
          <input
            type='file'
            accept='audio/*'
            id={id}
            name={name}
            multiple={true}
            onChange={handleFilesChange}
          />
        </div>
      </label>
    </div>
  );
}
