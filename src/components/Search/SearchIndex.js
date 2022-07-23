import React, { useEffect, useState } from 'react';
import { useGetSearchedItemsQuery } from '../../features/stymQuery';
import Downshift from 'downshift';
import Link from 'next/link';
import NProgress from 'nprogress';
import Search from '../../components/svg/search.svg';
import LoadingSpinner from '../LoadingSpinner';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debouncedValue, delay]);

  return debouncedValue;
}

export default function SearchIndex() {
  const [query, setQuery] = useState('');
  const debouncedSearchTerm = useDebounce(query, 500);

  const {
    data,
    // data: { list } = [],
    // data: { list: { styms } = {} } = {},
    isLoading,
    isFetching,
  } = useGetSearchedItemsQuery(
    {
      q: debouncedSearchTerm,
    },
    {
      skip: !debouncedSearchTerm,
    }
  );

  const handleSearch = (e) => {
    const query = e.target.value;
    setQuery(query);
  };

  if (isLoading) {
    NProgress.start();
  } else NProgress.done();

  const styms = data ? data.list?.styms : [];
  const files = data ? data.list?.files : [];
  const items = [...(styms || []), ...(files || [])];

  return (
    <Downshift
      // onChange={(selection) =>
      //   alert(
      //     selection ? `You selected ${selection.value}` : 'Selection Cleared'
      //   )
      // }
      itemToString={(item) => (item ? item.name : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
        itemCount,
      }) => (
        <div className='relative w-[85%] lg:mx-auto text-gray-600 lg:w-full mb-11'>
          <div
            className='w-full'
            {...getRootProps({}, { suppressRefError: true })}
          >
            <InputGroup size='sm'>
              <InputLeftElement
                zIndex={10}
                pointerEvents='none'
                top={'8px'}
                left={'26px'}
              >
                <Search />
              </InputLeftElement>
              <Input
                {...getInputProps({
                  type: 'text',
                  className: 'placeholder-gray-800',
                  pl: '72px',
                  h: '3rem',
                  backgroundColor: '#EAEEF2',
                  borderRadius: '30px',
                  onChange: handleSearch,
                  placeholder: 'Search',
                  border: '2px',
                  borderColor: 'transparent',
                  _focus: { borderColor: 'transparent' },
                  _hover: { borderColor: 'transparent' },
                  name: 'search',
                })}
              />
            </InputGroup>
          </div>
          <ul
            {...getMenuProps({
              className:
                'absolute bg-white shadow-md rounded-lg mt-2 w-full z-10 ',
            })}
          >
            {isOpen
              ? items &&
                items?.map((item, index) => (
                  <li
                    key={item?.stym ? item?.stym : item?.file?.id}
                    {...getItemProps({
                      index,
                      item,
                      style: {
                        backgroundColor:
                          highlightedIndex === index ? '#f7f7f7' : 'white',
                        fontWeight: selectedItem === item ? 'bold' : 'normal',
                        color: selectedItem === item ? 'red' : 'black',
                      },
                      className: 'p-2',
                    })}
                  >
                    <Link
                      href={
                        item.stymId === 0 && item.stym === null
                          ? `/profile/documents`
                          : item.stym
                          ? `/my-stym/${item.stym}`
                          : `/my-stym/`
                      }
                    >
                      <a>
                        <div className='flex gap-4 '>
                          <img
                            className='rounded-lg'
                            src={item.image || '/stym-dark.png'}
                            alt={item.name}
                            width={50}
                          />
                          {item.name}
                        </div>
                      </a>
                    </Link>
                  </li>
                ))
              : null}
            {data?.list.length === 0 && inputValue && (
              <div className='p-4'>
                {isLoading || isFetching ? '...' : "We could't find anything"}
              </div>
            )}
          </ul>
        </div>
      )}
    </Downshift>
  );
}
