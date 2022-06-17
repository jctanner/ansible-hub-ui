import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import './list-item.scss';

import {
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  LabelGroup,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { Link } from 'react-router-dom';

import { Paths, formatPath } from 'src/paths';
import {
  NumericLabel,
  Tag,
  Logo,
  DeprecatedTag,
  DateComponent,
} from 'src/components';
import { convertContentSummaryCounts } from 'src/utilities';
import { Constants } from 'src/constants';
import { SignatureBadge } from '../signing';

import { LegacyRoleDetailType } from 'src/api/response-types/legacy-role';

interface LegacyRoleProps {
  role: LegacyRoleDetailType;
  show_thumbnail: boolean;
}

export class LegacyRoleListItem extends React.Component<LegacyRoleProps> {
  render() {
    const { role, show_thumbnail } = this.props;
    //const role_url = 'legacy/roles/' + role.github_user + '/' + role.name;
    //const role_url = '/' + role.github_user + '/' + role.name;
    const role_url = role.github_user + '/' + role.name;

    let release_date = null
    let release_name = null
    const lv = role.summary_fields.versions[0]
    if (lv !== undefined && lv !== null) {
        release_date = lv.release_date
        release_name = lv.name
    }
    if (release_date === undefined || release_date === null || release_date === "") {
       release_date = role.modified 
    }
    if (release_name === undefined || release_name === null || release_name === "") {
       release_name = ""
    }

    const cells = [];

    if ( show_thumbnail !== false ) {
        cells.push(
          <DataListCell isFilled={false} alignRight={false} key='ns'>
            <Logo
              alt={t`role.github_user logo`}
              //fallbackToDefault
              image={role.summary_fields.namespace.avatar_url}
              size='70px'
              unlockWidth
              width='97px'
            ></Logo>
          </DataListCell>,
        );
    }

    cells.push(
      <DataListCell key='content'>
        <div>
          <Link to={role_url}>{role.name}</Link>
          <TextContent>
            <Text component={TextVariants.small}>
              <Trans>Provided by {role.github_user}</Trans>
            </Text>
          </TextContent>
        </div>
        <div className='hub-entry'>{role.description}</div>
        <div className='hub-entry'>
          <LabelGroup>
            {role.summary_fields.tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </LabelGroup>
        </div>
      </DataListCell>,
    );

    cells.push(
      <DataListCell isFilled={false} alignRight key='stats'>
        <div className='hub-right-col hub-entry'>
          <Trans>
            Updated{' '}
            <DateComponent
              date={release_date}
            />
          </Trans>
        </div>
        <div className='hub-entry'>{release_name}</div>
      </DataListCell>,
    );

    return (
      <DataListItem data-cy='LegacyRoleListItem'>
        <DataListItemRow>
          <DataListItemCells dataListCells={cells} />
        </DataListItemRow>
      </DataListItem>
    );
  }
}