import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

export default function Modal({
  paddingLeft = null,
  paddingRight = null,
  alignItems = 'center',
  title,
  isOpen,
  setIsOpen,
  children,
}) {
  return (
    <>
      <ChakraModal isCentered isOpen={isOpen} onClose={setIsOpen}>
        <ModalOverlay />
        <ModalContent borderRadius={30} >
          <ModalHeader    
            paddingLeft={paddingLeft}
            paddingRight={paddingRight}
            display={'flex'}
            alignItems={alignItems}
            justifyContent='space-between'
            fontWeight={'500'}
            fontSize='2.25rem'
          >
            {title}
            <ModalCloseButton position={'static'}/>
          </ModalHeader>
          <ModalBody paddingBlock={'1.5rem'}>{children}</ModalBody>
        </ModalContent>
      </ChakraModal>
    </>
  );
}
