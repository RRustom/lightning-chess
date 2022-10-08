import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { HiLink } from 'react-icons/hi';
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import { display } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import DoneIcon from '@mui/icons-material/Done';

const InviteButton = () => {
  const { uuid } = useParams();
  //   const rootPath =
  //     process.env.NODE_ENV === 'production'
  //       ? process.env.REACT_APP_PROD_SERVER
  //       : process.env.REACT_APP_DEV_CLIENT;

  const copiedLink = 'localhost:3000' + '/' + uuid;
  const displayLink = copiedLink.slice(80) + '...';

  return (
    <div
      style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' }}
    >
      <TextField
        fullWidth
        defaultValue={copiedLink}
        InputProps={{
          readOnly: true,
        }}
        variant="outlined"
      />
      <_CopyLinkButton link={copiedLink} />
    </div>
  );
};

const _CopyLinkButton = ({ link }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <CopyToClipboard
      text={link}
      onCopy={() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      }}
    >
      <div
        style={{
          cursor: isCopied ? 'default' : 'pointer',
          color: isCopied ? 'yellow' : 'white',
        }}
      >
        <IconButton
          style={{
            marginLeft: 8,
            minHeight: 24,
            minWidth: 24,
          }}
        >
          {isCopied ? (
            <DoneIcon
              style={{
                fontSize: 24,
                marginTop: 2,
              }}
            />
          ) : (
            <HiLink />
          )}
        </IconButton>
      </div>
    </CopyToClipboard>
  );
};

export default InviteButton;
