import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Switch,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import Arrow from '../components/svg/out-arrow.svg';
import {
  useGetUserNotificationsSettingsQuery,
  useSetUserNotificationsSettingsMutation,
} from '../features/stymQuery';
import NProgress from 'nprogress';
import Select from 'react-select';
import { options } from '../components/SignUp/timezoneOptions';
import { useLocalStorage } from '../components/hooks/useLocalStorage';
import { toast } from 'react-toastify';

export default function Settings() {
  const { colorMode } = useColorMode();
  const [timezone, setTimezone] = useState();

  const { data: { settings } = {}, isLoading } =
    useGetUserNotificationsSettingsQuery();

  const [setSettings, { isLoading: isSetting }] =
    useSetUserNotificationsSettingsMutation();

  const [storedValue, setValue] = useLocalStorage('timezone');

  const handleChange = async (e) => {
    let id = e.target.id;
    let value = e.target.checked;
    const formData = new FormData();
    formData.append(id, value ? 1 : 0);

    try {
      const res = await setSettings(formData);
    } catch (error) {
      console.log(error);
    }
    NProgress.done();
  };

  const handleTimezone = async (timezone) => {
    const formData = new FormData();
    formData.append('timezone', timezone.value);
    try {
      const res = await setSettings(formData);
      if (res?.data?.status) {
        toast.success('Timezone updated!', {
          position: 'bottom-center',
        });
      } else {
        toast.error('Something went wrong!', {
          position: 'bottom-center',
        });
      }
    } catch (error) {
      console.log(error);
    }
    setValue(timezone);
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      marginBottom: '4rem',
    }),

    menu: (provided) => ({
      ...provided,

      textAlign: 'left',
      width: '20rem',
      backgroundColor: colorMode === 'dark' ? '#192642' : '#f7f8fa',
    }),

    control: (provided) => ({
      ...provided,
      display: 'flex',
      backgroundColor: colorMode === 'dark' ? '#192642' : '#f7f8fa',
      borderRadius: 10,
      padding: '10px',
      borderColor: colorMode === 'dark' ? '#192642' : 'none',
      width: '20rem',
    }),

    singleValue: (provided) => {
      return {
        ...provided,

        textAlign: 'left',
        color: colorMode === 'dark' ? '#cad3e7' : '#172747',
      };
    },

    input: (provided, state) => {
      return {
        ...provided,

        color: colorMode === 'dark' ? '#cad3e7' : '#172747',
      };
    },

    placeholder: (provided) => {
      return {
        ...provided,
        color: '#acacac',
        textAlign: 'left',
        fontSize: '14px',
      };
    },

    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected && data.label === storedValue.label
          ? '#ff8a58'
          : isFocused
          ? '#e3e3e3'
          : undefined,
        color: isDisabled
          ? undefined
          : isSelected && data.label === storedValue.label
          ? '#fff'
          : isFocused
          ? '#000'
          : undefined,
      };
    },
  };

  if (isSetting) {
    NProgress.start();
  }

  return (
    <Layout>
      <div>
        <h1 className='mb-20 text-5xl font-medium'>Settings</h1>
        <div className='flex items-center justify-between text-3xl font-medium'>
          <p>Notify me when...</p>
          {/* <FormControl w={'auto'} display='flex' alignItems={'center'}>
            <FormLabel mb={0} fontSize={30} htmlFor='privateMode'>
              Private mode
            </FormLabel>
            <Switch
              colorScheme={'brand'}
              onChange={handleChange}
              isChecked={settings?.privateMode}
              id='privateMode'
            />
          </FormControl> */}
        </div>
        <div className='flex flex-col justify-between gap-4 mb-5'>
          <TableContainer>
            <Table size='md' width={'50%'} variant='unstyled'>
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th fontFamily={'inherit'}>Email</Th>
                  <Th fontFamily={'inherit'}>Web App</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>My Styms are first viewed</Td>
                  <Td>
                    <Switch
                      colorScheme={'brand'}
                      onChange={handleChange}
                      isChecked={settings?.stymViewed}
                      id='stymViewed'
                    />
                  </Td>
                  <Td>
                    <Switch
                      colorScheme={'brand'}
                      onChange={handleChange}
                      isChecked={settings?.webStymViewed}
                      id='webStymViewed'
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Inbox messages</Td>
                  <Td>
                    <Switch
                      colorScheme={'brand'}
                      onChange={handleChange}
                      isChecked={settings?.inboxMsg}
                      id='inboxMsg'
                    />
                  </Td>
                  <Td>
                    <Switch
                      colorScheme={'brand'}
                      onChange={handleChange}
                      isChecked={settings?.webInboxMsg}
                      id='webInboxMsg'
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Team member changes on my Stym</Td>
                  <Td>
                    <Switch
                      onChange={handleChange}
                      colorScheme={'brand'}
                      isChecked={settings?.teamChange}
                      id='teamChange'
                    />
                  </Td>
                  <Td>
                    <Switch
                      colorScheme={'brand'}
                      onChange={handleChange}
                      isChecked={settings?.webTeamChange}
                      id='webTeamChange'
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <Select
        id='timezone'
        styles={customStyles}
        placeholder={storedValue ? '' : 'Select your timezone'}
        defaultValue={storedValue ? storedValue : null}
        options={options}
        components={{
          IndicatorSeparator: () => null,
        }}
        name='timezone'
        onChange={handleTimezone}
      ></Select>
      <div className='max-w-xs space-y-5'>
        <span className='text-3xl font-medium'>Links </span>
        <a
          target='_blank'
          href='https://stymconnect.com/StemConnectincPrivacy&terms.pdf'
          rel='noopener noreferrer'
          className={`flex justify-between text-2xl font-medium border-b-2 border-separate  cursor-pointer ${
            colorMode === 'dark' ? 'border-white' : 'border-black'
          }`}
        >
          ToS & Privacy Policy
          <Arrow className='w-10 ' />
        </a>

        <a
          target='_blank'
          href='https://stymconnect.com/#faq'
          rel='noopener noreferrer'
          className={`flex justify-between text-2xl font-medium border-b-2 border-separate  cursor-pointer ${
            colorMode === 'dark' ? 'border-white' : 'border-black'
          }`}
        >
          FAQs
          <Arrow className='w-10 ' />
        </a>
      </div>
    </Layout>
  );
}
