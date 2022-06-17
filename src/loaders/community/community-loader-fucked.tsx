import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import '../app.scss';
import {
  withRouter,
  Link,
  RouteComponentProps,
  matchPath,
} from 'react-router-dom';

import '@patternfly/patternfly/patternfly.scss';
import {
  DropdownItem,
  DropdownSeparator,
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageHeaderTools,
  PageSidebar,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';
import { reject, some } from 'lodash';

import { Routes } from './routes';
import { Paths, formatPath } from 'src/paths';
import {
  ActiveUserAPI,
  UserType,
  FeatureFlagsType,
  SettingsType,
} from 'src/api';
import {
  AboutModalWindow,
  UIVersion,
  AlertType,
  LoginLink,
  SmallLogo,
  StatefulDropdown,
} from 'src/components';
import { AppContext } from '../app-context';
import Logo from 'src/../static/images/logo_large.svg';

interface IState {
  user: UserType;
  selectedRepo: string;
  aboutModalVisible: boolean;
  toggleOpen: boolean;
  featureFlags: FeatureFlagsType;
  menuExpandedSections: string[];
  alerts: AlertType[];
  settings: SettingsType;
}

class App extends React.Component<RouteComponentProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      selectedRepo: 'published',
      aboutModalVisible: false,
      toggleOpen: false,
      featureFlags: null,
      menuExpandedSections: [],
      alerts: [],
      settings: null,
    };
  }

  componentDidUpdate() {
    console.log('LOADER APP componentDidUpdate');
    this.setRepoToURL();
  }

  componentDidMount() {
    console.log('LOADER APP componentDidMount');

    this.setRepoToURL();

    //const menu = this.menu();
    const menu = this.makeMenu();
    this.activateMenu(menu);

    const fakeuser = {
      username: 'john',
      groups: [],
    };

    /*
    this.setState({
      //user: fakeuser,
      menuExpandedSections: menu
        .filter((i) => i.type === 'section' && i.active)
        .map((i) => i.name),
    });
    */
  }

  makeMenu() {
    if (this.menu) {
      return this.menu;
    }
    return [];
  }

  render() {
    console.log('LOADER APP RENDER', this.props.location.pathname);

    const { featureFlags, menuExpandedSections, selectedRepo, user, settings } =
      this.state;

    // block the page from rendering if we're on a repo route and the repo in the
    // url doesn't match the current state
    // This gives componentDidUpdate a chance to recognize that route has chnaged
    // and update the internal state to match the route before any pages can
    // redirect the URL to a 404 state.
    const match = this.isRepoURL(this.props.location.pathname);
    if (match && match.params['repo'] !== selectedRepo) {
      console.log('LOADER APP RENDER return NULL!!!');
      return null;
    }

    let aboutModal = null;
    let docsDropdownItems = [];
    let userDropdownItems = [];
    let userName: string;

    /*
    if (user) {
      if (user.first_name || user.last_name) {
        userName = user.first_name + ' ' + user.last_name;
      } else {
        userName = user.username;
      }

      userDropdownItems = [
        <DropdownItem isDisabled key='username'>
          <Trans>Username: {user.username}</Trans>
        </DropdownItem>,
        <DropdownSeparator key='separator' />,
        <DropdownItem
          key='profile'
          component={
            <Link to={Paths.userProfileSettings}>{t`My profile`}</Link>
          }
        ></DropdownItem>,

        <DropdownItem
          key='logout'
          aria-label={'logout'}
          onClick={() =>
            ActiveUserAPI.logout().then(() => this.setState({ user: null }))
          }
        >
          {t`Logout`}
        </DropdownItem>,
      ];

      docsDropdownItems = [
        <DropdownItem
          key='customer_support'
          href='https://access.redhat.com/support'
          target='_blank'
        >
          <Trans>
            Customer Support <ExternalLinkAltIcon />
          </Trans>
        </DropdownItem>,
        <DropdownItem
          key='training'
          href='https://www.ansible.com/resources/webinars-training'
          target='_blank'
        >
          <Trans>
            Training <ExternalLinkAltIcon />
          </Trans>
        </DropdownItem>,
        <DropdownItem
          key='about'
          onClick={() =>
            this.setState({ aboutModalVisible: true, toggleOpen: false })
          }
        >
          {t`About`}
        </DropdownItem>,
      ];

      aboutModal = (
        <AboutModalWindow
          isOpen={this.state.aboutModalVisible}
          trademark=''
          brandImageSrc={Logo}
          onClose={() => this.setState({ aboutModalVisible: false })}
          brandImageAlt={t`Galaxy Logo`}
          productName={APPLICATION_NAME}
          user={user}
          userName={userName}
        ></AboutModalWindow>
      );
    }
    */

    const Header = (
      <PageHeader
        logo={<SmallLogo alt={APPLICATION_NAME}></SmallLogo>}
        logoComponent={({ children }) => (
          <Link
            to={formatPath(Paths.searchByRepo, {
              repo: this.state.selectedRepo,
            })}
          >
            {children}
          </Link>
        )}
        headerTools={
          <PageHeaderTools>
            {!user || user.is_anonymous ? (
              <LoginLink next={this.props.location.pathname} />
            ) : (
              <div>
                <StatefulDropdown
                  ariaLabel={'docs-dropdown'}
                  defaultText={<QuestionCircleIcon />}
                  items={docsDropdownItems}
                  toggleType='icon'
                />
                <StatefulDropdown
                  ariaLabel={'user-dropdown'}
                  defaultText={userName}
                  items={userDropdownItems}
                  toggleType='dropdown'
                />
              </div>
            )}
          </PageHeaderTools>
        }
        showNavToggle
      />
    );

    // if user and settings are truthy, menu == this.menu()
    // else menu == []
    //const menu = user && settings ? this.menu() : []; // no longer all set at the same time
    const menu = [];
    //const menu = this.menu();
    //console.log('LOADER APP RENDER MENU INIT', menu);
    //this.activateMenu(menu);

    const makeMenu = () => {
      return [];
    };

    const ItemOrSection = ({ item }) =>
      item.type === 'section' ? (
        <MenuSection section={item} />
      ) : (
        <MenuItem item={item} />
      );
    const MenuItem = ({ item }) => {
      console.log(`LOADER APP RENDER MenuItem === ${item}`);
      return item.condition({ user, settings, featureFlags }) ? (
        <NavItem
          isActive={item.active}
          onClick={(e) => {
            item.onclick && item.onclick();
            e.stopPropagation();
          }}
        >
          {item.url && item.external ? (
            <a
              href={item.url}
              data-cy={item['data-cy']}
              target='_blank'
              rel='noreferrer'
            >
              {item.name}
              <ExternalLinkAltIcon
                style={{ position: 'absolute', right: '32px' }}
              />
            </a>
          ) : item.url ? (
            <Link to={item.url}>{item.name}</Link>
          ) : (
            item.name
          )}
        </NavItem>
      ) : null;
    };

    const Menu = ({ items }) => (
      <>
        {items.map((item) => (
          <ItemOrSection key={item.name} item={item} />
        ))}
      </>
    );

    const MenuSection = ({ section }) =>
      section.condition({ user, featureFlags, settings }) ? (
        <NavExpandable
          title={section.name}
          groupId={section.name}
          isActive={section.active}
          isExpanded={menuExpandedSections.includes(section.name)}
        >
          <Menu items={section.items} />
        </NavExpandable>
      ) : null;

    const onToggle = ({ groupId, isExpanded }) => {
      console.log('LOADER APP onToggle', groupId, isExpanded);
      this.setState({
        menuExpandedSections: isExpanded
          ? [...menuExpandedSections, groupId]
          : reject(menuExpandedSections, (name) => name === groupId),
      });
    };

    // const Sidebar = (
    //   <PageSidebar
    //     theme='dark'
    //     nav={
    //       <Nav theme='dark' onToggle={onToggle}>
    //         <NavList>
    //           <NavGroup
    //             className={'nav-title'}
    //             title={APPLICATION_NAME}
    //           ></NavGroup>

    //           {/*
    //           {user && featureFlags && <Menu items={menu} />}
    //           */}
    //           <Menu items={menu} />
    //         </NavList>
    //       </Nav>
    //     }
    //   />
    // );

    const Sidebar = () => {
      console.log('LOADER APP RENDER Sidebar() called');

      //debugger;

      return (
        <PageSidebar
          theme='dark'
          nav={
            <Nav theme='dark' onToggle={onToggle}>
              <NavList>
                <NavGroup
                  className={'nav-title'}
                  title={APPLICATION_NAME}
                ></NavGroup>

                <Menu items={menu} />
              </NavList>
            </Nav>
          }
        />
      );
    };

    /*
    // Hide navs on login page
    if (
      this.props.location.pathname === Paths.login ||
      this.props.location.pathname === UI_EXTERNAL_LOGIN_URI
    ) {
      console.log('LOADER APP RENDER PATHS.LOGIN OR UI_EXTERNAL_LOGIN_URI');
      return this.ctx(<Routes updateInitialData={this.updateInitialData} />);
    }
    */

    console.log('LOADER APP RENDER DEFAULT RETURN');
    //debugger;
    return this.ctx(
      <Page isManagedSidebar={true} header={Header} sidebar={Sidebar()}>
        {this.state.aboutModalVisible && aboutModal}
        <Routes updateInitialData={this.updateInitialData} />
      </Page>,
    );
  }

  private menu() {
    console.log('LOADER APP menu()');

    const menuItem = (name, options = {}) => ({
      active: false,
      condition: () => true,
      ...options,
      type: 'item',
      name,
    });
    const menuSection = (name, options = {}, items = []) => ({
      active: false,
      condition: (...params) =>
        some(items, (item) => item.condition(...params)), // any visible items inside
      ...options,
      type: 'section',
      name,
      items,
    });

    const newMenu = [
      menuSection(t`Collections`, {}, [
        menuItem(t`Collections`, {
          url: formatPath(Paths.searchByRepo, {
            repo: this.state.selectedRepo,
          }),
          //condition: ({ settings, user }) =>
          //  settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          //  !user.is_anonymous,
        }),
        menuItem(t`Namespaces`, {
          url: Paths[NAMESPACE_TERM],
          //condition: ({ settings, user }) =>
          //  settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          //  !user.is_anonymous,
        }),
        menuItem(t`Repository Management`, {
          condition: ({ user }) => !user.is_anonymous,
          url: Paths.repositories,
        }),
        menuItem(t`API token management`, {
          url: Paths.token,
          condition: ({ user }) => !user.is_anonymous,
        }),
        menuItem(t`Approval`, {
          condition: ({ user }) => user.model_permissions.move_collection,
          url: Paths.approvalDashboard,
        }),
      ]),
      menuSection(t`Legacy`, {}, [
        menuItem(t`Community`, {
          url: Paths.legacyUsers,
        }),
        menuItem(t`Roles`, {
          url: Paths.legacyRoles,
        }),
      ]),
      menuSection(
        t`Execution Environments`,
        {
          condition: ({ featureFlags, user }) =>
            featureFlags.execution_environments && !user.is_anonymous,
        },
        [
          menuItem(t`Execution Environments`, {
            url: Paths.executionEnvironments,
          }),
          menuItem(t`Remote Registries`, {
            url: Paths.executionEnvironmentsRegistries,
          }),
        ],
      ),
      menuItem(t`Task Management`, {
        url: Paths.taskList,
        condition: ({ user }) => !user.is_anonymous,
      }),
      menuItem(t`Documentation`, {
        url: 'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform/',
        external: true,
        condition: ({ settings, user }) =>
          settings.GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS ||
          !user.is_anonymous,
      }),
      menuSection(t`User Access`, {}, [
        menuItem(t`Users`, {
          condition: ({ user }) => user.model_permissions.view_user,
          url: Paths.userList,
        }),
        menuItem(t`Groups`, {
          condition: ({ user }) => user.model_permissions.view_group,
          url: Paths.groupList,
        }),
      ]),
    ];

    console.log('LOADER APP menu length', newMenu.length);
    console.log('LOADER APP menu return', newMenu);
    //if (newMenu.length === 0) {
    //    debugger;
    //}
    return newMenu;
  }

  private activateMenu(items) {
    // activation means the menu item is correlated to the current url path
    console.log('LOADER APP activateMenu start', items);
    items.forEach(
      (item) =>
        (item.active =
          item.type === 'section'
            ? this.activateMenu(item.items)
            : this.props.location.pathname.startsWith(item.url)),
    );
    console.log('LOADER APP activateMenu done', items);
    return some(items, 'active');
  }

  private updateInitialData = (
    data: {
      user?: UserType;
      featureFlags?: FeatureFlagsType;
      settings?: SettingsType;
    },
    callback?: () => void,
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.setState(data as any, () => {
      if (callback) {
        callback();
      }
    });

  private setRepoToURL() {
    const match = this.isRepoURL(this.props.location.pathname);
    console.log('LOADER APP setRepoToUrl', this.props.location.pathname, match);
    if (match) {
      if (match.params['repo'] !== this.state.selectedRepo) {
        this.setState({ selectedRepo: match.params['repo'] });
      }
    }
  }

  private isRepoURL(location) {
    const matched = matchPath(location, {
      path: Paths.searchByRepo,
    });
    console.log('LOADER APP isRepoUrl', location, matched);
    return matched;
  }

  private ctx(component) {
    //console.log('ctx', 'component', component);
    //console.log('ctx', 'this.state.user', this.state.user);
    //console.log('ctx', 'this.setUser', this.setUser);
    //console.log('ctx', 'this.setRepo', this.setRepo);
    //console.log('ctx', 'this.state.selectedRepo', this.state.selectedRepo);
    //console.log('ctx', 'this.state.featureFlags', this.state.featureFlags);
    //console.log('ctx', 'this.state.alerts', this.state.alerts);
    //console.log('ctx', 'this.state.settings', this.state.settings);

    return (
      <AppContext.Provider
        value={{
          user: this.state.user,
          setUser: this.setUser,
          selectedRepo: this.state.selectedRepo,
          setRepo: this.setRepo,
          featureFlags: this.state.featureFlags,
          alerts: this.state.alerts,
          setAlerts: this.setAlerts,
          settings: this.state.settings,
        }}
      >
        {component}
        <UIVersion />
      </AppContext.Provider>
    );
  }

  private setUser = (user: UserType, callback?: () => void) => {
    console.log(`LOADER APP setUser ${user}`);
    this.setState({ user: user }, () => {
      if (callback) {
        callback();
      }
    });
  };

  private setRepo = (path: string) => {
    console.log(`LOADER APP setRepo ${path}`);
    this.props.history.push(path);
  };

  private setAlerts = (alerts: AlertType[]) => {
    this.setState({ alerts });
  };
}

export default withRouter(App);