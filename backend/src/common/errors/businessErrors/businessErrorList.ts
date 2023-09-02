import { keyBy } from 'lodash';

export const BusinessErrorsMap = keyBy(
  [
    {
      // code: UserErrorKey.USER_NOT_FOUND,
      // message: 'User not found!',
    },
  ],
  (err: { code: any }) => err.code,
);
