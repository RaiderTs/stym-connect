import { useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import ProfileHeader from './components/ProfileHeader';
import ProfileNav from './components/ProfileNav';
import Table from './components/Table';
import Modal from '../../components/Modal';
import AddUserToTeamForm from './components/AddUserToTeamForm';
import {
  useAddUserToTeamMutation,
  useGetTeamMembersQuery,
} from '../../features/stymQuery';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { userSelector } from '../../selectors/auth';
import { useSelector } from 'react-redux';
import { Button } from '@chakra-ui/react';

export default function UsersAndAccess() {
  const router = useRouter();
  const user = useSelector(userSelector);
  const [isOpen, setIsOpen] = useState(false);

  const { data: { users } = [], isLoading: teamLoading } =
    useGetTeamMembersQuery();

  const [addUserToTeam, isLoading] = useAddUserToTeamMutation();

  const handleAddUser = async (values) => {
    const formData = new FormData();
    formData.append('email', values.email);

    try {
      const res = await addUserToTeam(formData);
      // console.log(res, 'res');
      if (res.data.message === 'tariff_exists') {
        toast.error("This user can't be added to the team", {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
        });
      } else if (res.data.message === 'editor_not_found') {
        toast.error("Sorry, we couldn't find a user with that email", {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Role',
        accessor: 'role',
      },
    ],
    []
  );

  if (user.tariff !== 'premium') {
    router.push('/profile');
  }

  return (
    <Layout>
      <ProfileHeader />

      <Button
        fontWeight={'normal'}
        _hover={{ bg: 'brand.200' }}
        _active={{ bg: 'brand.200', color: 'white' }}
        borderRadius={30}
        bg='brand.200'
        width={'5rem'}
        ml={'auto'}
        className='flex items-center px-4 py-2 text-white border border-my-orange bg-my-orange'
        onClick={() => setIsOpen(!isOpen)}
      >
        + User
      </Button>
      <div className='flex'>
        <ProfileNav />
        <Table columns={columns} data={users ? users : []} />
      </div>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} title='New User'>
        <AddUserToTeamForm
          setIsOpen={setIsOpen}
          action='Add'
          onSubmit={handleAddUser}
        />
      </Modal>
    </Layout>
  );
}
