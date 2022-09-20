import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { HiLink } from 'react-icons/hi';
import { useParams } from 'react-router-dom';

const InviteButton = () => {
  const { uuid } = useParams();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  //   const rootPath =
  //     process.env.NODE_ENV === 'production'
  //       ? process.env.REACT_APP_PROD_SERVER
  //       : process.env.REACT_APP_DEV_CLIENT;

  const copiedLink = 'localhost:3000' + '/' + uuid;

  return (
    <div>
      Copy Invite Link
      <CopyToClipboard
        text={copiedLink}
        onCopy={() => {
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 3000);
        }}
      >
        <button>
          <HiLink />
        </button>
      </CopyToClipboard>
      {isCopied ? <span style={{ color: 'red' }}>Copied.</span> : null}
    </div>
  );
};

export default InviteButton;
