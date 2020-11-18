// Copyright 2017-2020 @polkadot/app-contracts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppProps as Props } from '@polkadot/react-components/types';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, Tabs } from '@polkadot/react-components';
import { useContracts, useToggle } from '@polkadot/react-hooks';

import introMd from './md/intro.md';
import store from './store';
import Contracts from './Contracts';
import ContractAdd from './Contracts/Add';
import Banner from './Banner';
import Codes from './Codes';
import CodeAdd from './Codes/Add';
import CodeUpload from './Codes/Upload';
import Deploy from './Deploy';
import Summary from './Summary';
import { useTranslation } from './translate';

function ContractsTabbs({ basePath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const itemsRef = useRef([
    {
      isRoot: true,
      name: 'contracts',
      text: t('Contracts')
    }
  ]);

  return (
    <Tabs
      basePath={basePath}
      items={itemsRef.current}
    />
  );
}

function ContractsApp(): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allContracts } = useContracts();
  const [codeHash, setCodeHash] = useState<string | undefined>();
  const [constructorIndex, setConstructorIndex] = useState(0);
  const [isAddOpen, toggleAdd] = useToggle();
  const [isDeployOpen, toggleDeploy, setIsDeployOpen] = useToggle();
  const [isHashOpen, toggleHash] = useToggle();
  const [isUploadOpen, toggleUpload] = useToggle();
  const [updated, setUpdated] = useState(Date.now());
  const [allCodes, setAllCodes] = useState(store.getAllCode());

  const _onShowDeploy = useCallback(
    (codeHash: string, constructorIndex: number): void => {
      setCodeHash(codeHash || (allCodes && allCodes[0] ? allCodes[0].json.codeHash : undefined));
      setConstructorIndex(constructorIndex);
      toggleDeploy();
    },
    [allCodes, toggleDeploy]
  );

  const _onCloseDeploy = useCallback(
    () => setIsDeployOpen(false),
    [setIsDeployOpen]
  );

  useEffect(
    (): void => {
      const triggerUpdate = (): void => {
        setUpdated(Date.now());
        setAllCodes(store.getAllCode());
      };

      store.on('new-code', triggerUpdate);
      store.on('removed-code', triggerUpdate);
      store
        .loadAll()
        .then(() => setAllCodes(store.getAllCode()))
        .catch((): void => {
          // noop, handled internally
        });
    },
    []
  );

  return (
    <React.Fragment>
      <Summary trigger={updated} />
      <Button.Group>
        <Button
          icon='plus'
          label={t('Upload WASM')}
          onClick={toggleUpload}
        />
        <Button
          icon='plus'
          label={t('Add an existing code hash')}
          onClick={toggleHash}
        />
        <Button
          icon='plus'
          label={t('Add an existing contract')}
          onClick={toggleAdd}
        />
      </Button.Group>
      <Banner />
      <Contracts
        contracts={allContracts}
        updated={updated}
      />
      <Codes
        onShowDeploy={_onShowDeploy}
        updated={updated}
      />
      {codeHash && isDeployOpen && (
        <Deploy
          codeHash={codeHash}
          constructorIndex={constructorIndex}
          onClose={_onCloseDeploy}
          setConstructorIndex={setConstructorIndex}
        />
      )}
      {isUploadOpen && (
        <CodeUpload onClose={toggleUpload} />
      )}
      {isHashOpen && (
        <CodeAdd onClose={toggleHash} />
      )}
      {isAddOpen && (
        <ContractAdd onClose={toggleAdd} />
      )}
    </React.Fragment>
  );
}

export const Component = React.memo(styled(ContractsApp)`
  .ui--Table td > article {
    background: transparent;
    border: none;
    margin: 0;
    padding: 0;
  }
`);
export const TabsComponent = React.memo(ContractsTabbs);
export const helpText = introMd as string;
