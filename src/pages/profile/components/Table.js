import Dots from '../../../components/svg/dots.svg';
import { Fragment } from 'react';
import { useDeleteUserFromTeamMutation } from '../../../features/stymQuery';
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorMode,
} from '@chakra-ui/react';
export default function Table({ columns, data }) {
  const [deleteUserFromTeam] = useDeleteUserFromTeamMutation();
  const { colorMode } = useColorMode();

  const handleDeleteUserFromTeam = async (id) => {
    await deleteUserFromTeam(id);
  };

  return (
    <Box className='max-w-2xl mx-auto'>
      <TableContainer>
        <ChakraTable variant='simple'>
          <Thead>
            <Tr
              borderBottom={'1px'}
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            >
              {columns.map((column) => (
                <Th fontFamily={'inherit'} key={column.accessor}>
                  {column.Header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => (
              <Tr key={row.email}>
                <Th
                  fontSize={15}
                  fontWeight={'500'}
                  fontFamily={'inherit'}
                  textTransform='inherit'
                >
                  {row.email}
                </Th>
                <Td fontSize={14}>
                  {row.name.includes('null') ? 'N/A' : row.name}
                </Td>
                <Td fontSize={14}>{row.access}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      _hover={{ bg: 'transparent' }}
                      _active={{ bg: 'transparent' }}
                      _focus={{ outline: 'none' }}
                      backgroundColor={'transparent'}
                      as={IconButton}
                      icon={<Dots className='w-5' />}
                    />

                    <MenuList>
                      <MenuItem
                        onClick={() => handleDeleteUserFromTeam(row.id)}
                      >
                        Remove from the team
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </ChakraTable>
      </TableContainer>
    </Box>
  );
}
