import { Menu, MenuButton, MenuList, MenuItem, Flex } from '@chakra-ui/react';

export default function ChakraMenu({ menuBtn, name, options }) {
  return (
    <Menu>
      <MenuButton display=''>
        <Flex gap={15} mr={1}>
          {name}
          {menuBtn}
        </Flex>
      </MenuButton>
      <MenuList>
        {options.map((option) => (
          <MenuItem onClick={option.handleClick()} key={option.id}>
            {option.icon ? option.icon : null}
            {option.title}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
