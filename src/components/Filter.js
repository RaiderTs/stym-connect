import FilterIcon from '../components/svg/filter.svg';
import { format } from 'date-fns';
import { useState } from 'react';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import {
  Box,
  Popover,
  Button,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  PopoverCloseButton,
  Flex,
  Checkbox,
  Skeleton,
  useColorMode,
} from '@chakra-ui/react';
import Arrow from '../components/svg/arrowFilter.svg';
import { useGetFoldersQuery } from '../features/stymQuery';

export default function Filter({ setQueryOptions, queryOptions }) {
  const { colorMode } = useColorMode();
  const [date, setDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [folderIds, setFolderIds] = useState([]);
  const [dateChecked, setDateChecked] = useState(false);

  const { data, isLoading } = useGetFoldersQuery();
  const handleChange = (e) => {
    if (e.target.checked) {
      setFolderIds([...folderIds, e.target.value]);
    } else {
      setFolderIds(folderIds.filter((id) => id !== e.target.value));
    }
  };

  // console.log(queryOptions, 'queryOptions');
  // console.log(folderIds, 'date');

  const propsConfigs = {
    inputProps: {
      size: 'sm',
      borderRadius: '8px',
      _focus: { borderColor: 'brand-primary.500' },
      width: '90%',
    },
    popoverProps: {
      padding: '5rem',
    },
    dayOfMonthBtnProps: {
      borderColor: 'brand-primary.500',
    },
  };

  const handleClearFilter = () => {
    setQueryOptions({});
    setFolderIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setQueryOptions((prevState) => ({
      ...prevState,
      sortFolder: folderIds.length > 0 ? folderIds : null,
      ...(dateChecked && { from: format(date, 'yyyy-MM-dd') }),
      ...(dateChecked && { to: format(endDate, 'yyyy-MM-dd') }),
      // to: format(endDate, 'yyyy-MM-dd'),
    }));
  };

  // console.log(queryOptions?.sortFolder.includes('100'));
  return (
    <Popover isLazy>
      {({ onClose, isOpen }) => (
        <>
          <PopoverTrigger>
            <span className='flex items-center gap-3 cursor-pointer'>
              Filter
              <FilterIcon
                className={`${
                  colorMode === 'dark'
                    ? 'text-my-orange'
                    : 'text-primary-purple'
                }`}
                role='button'
                name='filter'
              />
            </span>
          </PopoverTrigger>
          <PopoverContent _focus={{ boxShadow: 'none' }} borderRadius='30px'>
            <PopoverHeader
              fontWeight={'semibold'}
              mt={5}
              border='0'
              p={5}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <PopoverCloseButton position={'static'} order={1} />
              Filter
            </PopoverHeader>
            <PopoverBody p={5}>
              <form onSubmit={handleSubmit} className=' w-100'>
                <Box experimental_spaceY={2} mb={4}>
                  {/* {true && <Skeleton h={5} />} */}
                  {data && !isLoading ? (
                    data.folders.map((folder) => (
                      <Flex key={folder.id} justify={'space-between'}>
                        {folder.name}
                        {/* {queryOptions.sortFolder.includes(folder.id)} */}
                        <Checkbox
                          _focus={{ boxShadow: 'none' }}
                          colorScheme={'brand-primary'}
                          name={folder.name}
                          value={folder.id}
                          checked={queryOptions?.sortFolder?.includes(
                            folder.id.toString() || false
                          )}
                          onChange={handleChange}
                        />
                      </Flex>
                    ))
                  ) : (
                    <>
                      <Skeleton h={5} />
                      <Skeleton h={5} />
                      <Skeleton h={5} />
                      <Skeleton h={5} />
                      <Skeleton h={5} />
                    </>
                  )}
                </Box>
                <div className='flex items-center mb-12 '>
                  <SingleDatepicker
                    propsConfigs={propsConfigs}
                    name='date-start'
                    date={date}
                    onDateChange={setDate}
                    disabled={!dateChecked}
                  />
                  <Arrow className=' left-[48%] bottom-[32%] mx-2' />

                  <SingleDatepicker
                    propsConfigs={propsConfigs}
                    dateFormat='dd/MM/yyyy'
                    name='date-end'
                    date={endDate}
                    onDateChange={setEndDate}
                    disabled={!dateChecked}
                  />
                  <Checkbox
                    ml={5}
                    isChecked={dateChecked}
                    onChange={() => setDateChecked(!dateChecked)}
                    colorScheme={'brand-primary'}
                  />
                </div>
                <Flex gap={5}>
                  <Button
                    type='submit'
                    w='100%'
                    mb={5}
                    border={'2px solid'}
                    bg='transparent'
                    borderColor={colorMode === 'dark' ? 'gray.200' : 'gray.600'}
                    _hover={'none'}
                    fontWeight={'normal'}
                    h={'3rem'}
                    onClick={handleClearFilter}
                    color={colorMode === 'dark' ? 'gray.200' : 'gray.600'}
                  >
                    Clear
                  </Button>
                  <Button
                    type='submit'
                    w='100%'
                    mb={5}
                    bg={'brand-primary.500'}
                    color='white'
                    _hover={'none'}
                    fontWeight={'normal'}
                    h={'3rem'}
                    onClick={onClose}
                  >
                    Done
                  </Button>
                </Flex>
              </form>
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
