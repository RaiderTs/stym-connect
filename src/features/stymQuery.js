import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REHYDRATE } from 'redux-persist';

export const stymApi = createApi({
  reducerPath: 'stymApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.stymconnect.com/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.user?.token;

      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set('Authorization', `${token}`);
      }

      return headers;
    },
  }),
  refetchOnMountOrArgChange: 5,
  // extractRehydrationInfo(action, { reducerPath }) {
  //   if (action.type === REHYDRATE) {
  //     return action.payload[reducerPath];
  //   }
  // },
  tagTypes: [
    'Folders',
    'Styms',
    'StymById',
    'Shares',
    'Notifications',
    'Search',
    'Team members',
    'Contacts',
    'Documents',
    'Drag and drop',
    'Profile',
    'Notifications',
    'SettingsNotifications',
    'Group',
    'GroupContacts',
    'Inbox',
    'Trash',
  ],
  endpoints: (builder) => ({
    getAllStyms: builder.query({
      query: (options = {}) => ({
        url: `stym/list?${
          options.sortName ? `sort[name]=${options.sortName}` : ''
        }${options.sortType ? `&sort[type]=${options.sortType}` : ''}${
          options.sortFolder ? `&sort[folder]=[${options.sortFolder}]` : ''
        }${options.from ? `&from=${options.from}` : ''}${
          options.to ? `&to=${options.to}` : ''
        } `,
      }),
      providesTags: ['Styms'],
    }),

    getSharedFiles: builder.query({
      query: () => 'stym/share/list',
      providesTags: ['Shares'],
    }),
    createStym: builder.mutation({
      query: (body) => ({
        url: 'stym/add',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Styms'],
    }),
    createStymShare: builder.mutation({
      query: (body) => ({
        url: 'stym/share/create',
        method: 'POST',
        body: body,
      }),
    }),
    editStymShare: builder.mutation({
      query: (body) => ({
        url: 'share/access/change',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['StymById', 'Shares', 'Styms'],
    }),
    activateShare: builder.mutation({
      query: (hash) =>
        `https://api.stymconnect.com/auth/stym/share/access/${hash}`,
      invalidatesTags: ['Notifications', 'Inbox'],
    }),

    deleteStym: builder.mutation({
      query: (id) => {
        return {
          url: `stym/${id}/remove`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Styms'],
    }),
    getFolders: builder.query({
      query: (id) => (id ? `folders?folder=${id}` : 'folders'),
      providesTags: ['Folders'],
    }),
    createFolder: builder.mutation({
      query: (options) => {
        const { body, stymId } = options;
        return {
          url: `stym/${stymId}/folder/add`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Folders', 'StymById'],
    }),
    deleteFolder: builder.mutation({
      query: (id) => {
        return {
          url: `folder/${id}/remove`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Folders', 'StymById'],
    }),
    getFolderById: builder.query({
      query: (id) => `stym/folder/${id}/edit`,
    }),
    getFilesInFolder: builder.query({
      query: (id) => `folder/${id}/files`,
      providesTags: ['Folders'],
    }),
    addStymToFolder: builder.mutation({
      query: (options) => {
        const { folderId, stymId } = options;
        return {
          url: `/stym/${stymId}/folder/${folderId}/add`,
          method: 'POST',
        };
      },
      invalidatesTags: ['StymById'],
    }),

    getStymById: builder.query({
      query: (id) => ({ url: `stym/${id}/edit` }),
      providesTags: ['StymById'],
    }),
    getFilesInStymById: builder.query({
      query: (id) => ({ url: `stym/${id}/files` }),
      providesTags: ['StymById'],
    }),
    editStymCover: builder.mutation({
      query: (options) => {
        const { stymId, body } = options;
        return {
          url: `stym/${stymId}/edit`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['StymById'],
    }),
    editStymName: builder.mutation({
      query: (options) => {
        const { stymId, body } = options;
        return {
          url: `stym/${stymId}/edit`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['StymById'],
    }),
    createFile: builder.mutation({
      query: (options) => {
        const { body, stymId, folderId } = options;
        return {
          url: `stym/${stymId}/folder/${folderId}/file/add`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['StymById', 'Styms'],
    }),
    deleteFile: builder.mutation({
      query: (options) => {
        const { stymId, folderId, fileId } = options;
        return {
          url: `stym/${stymId}/folder/${folderId}/file/${fileId}/remove`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['StymById', 'Styms', 'Shares'],
    }),

    getNotifications: builder.query({
      query: () => 'notification',
      providesTags: ['Notifications'],
    }),

    setNotificationIgnored: builder.mutation({
      query: (notificationId) => ({
        url: `notification/${notificationId}/ignored`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    getSearchedItems: builder.query({
      query: (options) => ({
        url: `search`,
        params: options,
      }),
      providesTags: ['Search'],
    }),
    getTeamMembers: builder.query({
      query: () => 'payment/premium/users',
      providesTags: ['Team members'],
    }),
    addUserToTeam: builder.mutation({
      query: (body) => ({
        url: 'payment/premium/add-user',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Team members'],
    }),
    deleteUserFromTeam: builder.mutation({
      query: (id) => ({
        url: 'payment/premium/remove-user',
        method: 'DELETE',
        body: { editor: id },
      }),
      invalidatesTags: ['Team members'],
    }),
    getUserContacts: builder.query({
      query: () => 'user/profile/contact',
      providesTags: ['Contacts'],
    }),

    removeUserContacts: builder.mutation({
      query: (contactId) => `user/profile/contact/${contactId}/remove`,
      invalidatesTags: ['Contacts'],
    }),

    createContact: builder.mutation({
      query: (body) => ({
        url: 'user/profile/contact/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Contacts'],
    }),
    getDocuments: builder.query({
      query: () => 'user/profile/documents',
      providesTags: ['Documents'],
    }),
    uploadDocuments: builder.mutation({
      query: (body) => {
        return {
          url: `user/profile/document/save`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Documents'],
    }),
    deleteDocuments: builder.mutation({
      query: (body) => {
        return {
          url: `user/profile/document/remove`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Documents'],
    }),
    shareDocuments: builder.mutation({
      query: (body) => {
        return {
          url: `stym/share/create`,
          method: 'POST',
          body,
        };
      },
    }),
    getPlayList: builder.mutation({
      query: (body) => {
        return {
          url: 'files/play-list/',
          method: 'POST',
          body,
        };
      },
    }),
    getUserProfileData: builder.query({
      query: () => ({ url: 'user/profile/setting' }),
      providesTags: ['Profile'],
    }),

    updateProfileData: builder.mutation({
      query: (user) => ({
        url: 'user/profile/setting',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Profile'],
    }),
    restoreAccount: builder.mutation({
      query: (options) => ({
        url: `https://api.stymconnect.com/auth/restore/${options.token}`,
        method: 'POST',
        body: options.body,
      }),
    }),
    restoreAccountRequest: builder.mutation({
      query: (body) => ({
        url: 'https://api.stymconnect.com/auth/restore',
        method: 'POST',
        body,
      }),
    }),
    getUserNotificationsSettings: builder.query({
      query: () => 'user/setting',
      providesTags: ['SettingsNotifications'],
    }),
    setUserNotificationsSettings: builder.mutation({
      query: (body) => ({
        url: 'user/setting',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SettingsNotifications'],
    }),

    addToMyStymPage: builder.mutation({
      query: (shareId) => `share/home-page/add/${shareId}`,
      invalidatesTags: ['Shares'],
    }),

    removeFromMyStymPage: builder.mutation({
      query: (shareId) => `share/home-page/remove/${shareId}`,

      invalidatesTags: ['Shares'],
    }),
    //
    createGroup: builder.mutation({
      query: (body) => ({
        url: 'user/profile/contact/group/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),
    getListGroups: builder.query({
      query: () => 'user/profile/contact/group/list',
      providesTags: ['Group'],
    }),

    removeGroup: builder.mutation({
      query: (contactGroupId) =>
        `user/profile/contact/group/${contactGroupId}/remove`,

      invalidatesTags: ['Group'],
    }),

    editGroup: builder.mutation({
      query: (options) => {
        const { data, contactGroupId } = options;
        return {
          url: `user/profile/contact/group/${contactGroupId}/edit`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['Group'],
    }),

    //
    getGroupContacts: builder.query({
      query: (contactGroupId) =>
        `user/profile/contact/group/get/${contactGroupId}`,
      providesTags: ['GroupContacts', 'Group'],
    }),

    removeContactInGroup: builder.mutation({
      query: ({ contactGroupId, contactId }) =>
        `user/profile/contact/group/${contactGroupId}/contact/${contactId}/remove`,
      invalidatesTags: ['GroupContacts'],
    }),

    addContactInGroup: builder.mutation({
      query: ({ contactGroupId, contactId }) => {
        return {
          url: `user/profile/contact/group/${contactGroupId}/contact/${contactId}/add`,
          method: 'POST',
        };
      },
      invalidatesTags: ['GroupContacts'],
    }),
    //  inbox

    inboxUnread: builder.mutation({
      query: (inboxId) => {
        return {
          url: `inbox/${inboxId}/unread`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Inbox'],
    }),

    inboxRead: builder.mutation({
      query: (inboxId) => {
        return {
          url: `inbox/${inboxId}/read`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Inbox'],
    }),

    removeInbox: builder.mutation({
      query: (inboxId) => {
        return {
          url: `inbox/${inboxId}/remove`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Inbox'],
    }),

    inbox: builder.query({
      query: (options) => ({
        url: `inbox/list?${options.limit && `limit=${options.limit}`}${
          options.page && `&page=${options.page}`
        }`,
      }),
      providesTags: ['Inbox'],
    }),

    // trash

    getTrashList: builder.query({
      query: (options) => ({
        url: `stym/trash/list?${options.limit && `limit=${options.limit}`}${
          options.page && `&page=${options.page}`
        }`,
      }),
      providesTags: ['Trash'],
    }),

    restoreFileFromTrash: builder.mutation({
      query: (fileId) => {
        return {
          url: `stym/trash/restore/file/${fileId}`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Trash'],
    }),

    restoreStymFromTrash: builder.mutation({
      query: (stymId) => {
        return {
          url: `stym/trash/restore/stym/${stymId}`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Trash'],
    }),

    removeFileFromTrash: builder.mutation({
      query: (fileId) => {
        return {
          url: `stym/trash/remove/file/${fileId}`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Trash'],
    }),

    removeStymFromTrash: builder.mutation({
      query: (stymId) => {
        return {
          url: `stym/trash/remove/stym/${stymId}`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Trash'],
    }),

    removeAllDataFromTrash: builder.mutation({
      query: () => {
        return {
          url: `stym/trash/remove/all`,
          method: 'POST',
        };
      },
      invalidatesTags: ['Trash'],
    }),

    getRemovedStymInfo: builder.query({
      query: (stymId) => `stym/trash/stym/${stymId}`,
    }),

    //  sortShare
    sortShareFiles: builder.query({
      query: (options = {}) => ({
        url: `stym/share/list?${
          options.sortName ? `sort=${options.sortName}` : ''
        }${options.sortLastModified ? `sort=${options.sortLastModified}` : ''}${
          options.sortDate ? `sort=[${options.sortDate}]` : ''
        } `,
      }),
      providesTags: ['Shares'],
    }),
    getFileById: builder.query({
      query: (fileId) => `stym/0/folder/0/file/${fileId}/edit`,
    }),

    // public link

    createPublicLink: builder.mutation({
      query: (body) => ({
        url: 'link/create',
        method: 'POST',
        body: body,
      }),
    }),

    getDataForPublicLink: builder.query({
      query: (stymId) => `https://api.stymconnect.com/stym/${stymId}`,
    }),

    // save folder by id

    editFolderNameInStym: builder.mutation({
      query: (options) => {
        const { stymId, folderId, body } = options;
        return {
          url: `stym/${stymId}/folder/${folderId}/edit`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['StymById'],
    }),

    deleteFolderInStym: builder.mutation({
      query: (options) => {
        const { stymId, folderId } = options;

        return {
          url: `stym/${stymId}/folder/${folderId}/remove`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['StymById'],
    }),

    // Activity Log
    addActivityLog: builder.mutation({
      query: (body) => {
        return {
          url: `stym/activity/log/download/set`,
          method: 'POST',
          body,
        };
      },
    }),
  }),
});

export const {
  useAddActivityLogMutation,
  useGetDataForPublicLinkQuery,
  useDeleteFolderInStymMutation,
  useEditFolderNameInStymMutation,
  useCreatePublicLinkMutation,
  useSortShareFilesQuery,
  useGetAllStymsQuery,
  useGetStymByIdQuery,
  useCreateStymShareMutation,
  useEditStymShareMutation,
  useActivateShareMutation,
  useGetFilesInStymByIdQuery,
  useCreateFileMutation,
  useDeleteFileMutation,
  useCreateStymMutation,
  useCreateFolderMutation,
  useGetFoldersQuery,
  useAddStymToFolderMutation,
  useDeleteStymMutation,
  useGetFilesInFolderQuery,
  useGetFolderByIdQuery,
  useDeleteFolderMutation,
  useGetNotificationsQuery,
  useGetSearchedItemsQuery,
  useAddUserToTeamMutation,
  useGetTeamMembersQuery,
  useGetUserContactsQuery,
  useCreateContactMutation,
  useDeleteUserFromTeamMutation,
  useGetDocumentsQuery,
  useUploadDocumentsMutation,
  useDeleteDocumentsMutation,
  useShareDocumentsMutation,
  useGetSharedFilesQuery,
  useEditStymCoverMutation,
  useEditStymNameMutation,
  useGetPlayListMutation,
  useGetUserProfileDataQuery,
  useUpdateProfileDataMutation,
  useRestoreAccountMutation,
  useRestoreAccountRequestMutation,
  useGetUserNotificationsSettingsQuery,
  useSetUserNotificationsSettingsMutation,
  useSetNotificationIgnoredMutation,
  useAddToMyStymPageMutation,
  useRemoveFromMyStymPageMutation,
  useCreateGroupMutation,
  useGetListGroupsQuery,
  useRemoveGroupMutation,
  useRemoveUserContactsMutation,
  useEditGroupMutation,
  useGetGroupContactsQuery,
  useRemoveContactInGroupMutation,
  useAddContactInGroupMutation,
  useGetTrashListQuery,
  useRestoreFileFromTrashMutation,
  useRestoreStymFromTrashMutation,
  useRemoveFileFromTrashMutation,
  useRemoveStymFromTrashMutation,
  useRemoveAllDataFromTrashMutation,
  useGetRemovedStymInfoQuery,
  useInboxQuery,
  useInboxUnreadMutation,
  useInboxReadMutation,
  useRemoveInboxMutation,
  useGetFileByIdQuery,
} = stymApi;
