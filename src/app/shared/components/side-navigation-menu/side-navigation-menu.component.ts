import {
  Component,
  NgModule,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  DxTreeViewModule,
  DxTreeViewComponent,
  DxTreeViewTypes,
} from 'devextreme-angular/ui/tree-view';
import { navigation } from '../../../app-navigation';

import * as events from 'devextreme/events';
import { AuthService, IUser } from '../../services';

@Component({
  selector: 'app-side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss'],
})
export class SideNavigationMenuComponent
  implements AfterViewInit, OnDestroy, OnInit
{
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;
  idRole!: any;

  @Input()
  user!: IUser | null;

  @Output()
  selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();

  @Output()
  openMenu = new EventEmitter<any>();

  private _selectedItem!: String;
  @Input()
  set selectedItem(value: String) {
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }

    this.menu.instance.selectItem(value);
  }

  private _items!: Record<string, unknown>[];

  get items() {
    if (!this._items && this.idRole) {
      console.log('Current User Role ID:', this.idRole);
  
      if (this.idRole === 1) {
        // Si l'idRole est égal à 1, afficher uniquement la catégorie "Outils" avec la sous-catégorie "Profile"
        this._items = navigation
          .map((item) => {
            if (item.text === 'Outils') {
              return {
                ...item,
                items: item.items?.filter((subItem) => {
                  return subItem.text === 'Profile';
                }),
              };
            } else {
              return null;
            }
          })
          .filter(Boolean)
          .map((item) => {
            if (item!.path && !/^\//.test(item!.path)) {
              item!.path = `/${item!.path}`;
            }
            return { ...item, expanded: !this._compactMode };
          });
      } else {
        this._items = navigation
          .map((item) => {
            if (item.text === 'Outils' && this.idRole !== 2) {
              return {
                ...item,
                items: item.items?.filter((subItem) => {
                  return !(subItem.text === 'Administration');
                }),
              };
            } else if (item.text === 'Administration' && this.idRole !== 2) {
              return null;
            } else {
              return item;
            }
          })
          .filter(Boolean)
          .map((item) => {
            if (item!.path && !/^\//.test(item!.path)) {
              item!.path = `/${item!.path}`;
            }
            return { ...item, expanded: !this._compactMode };
          });
      }
    }
    return this._items;
  }
  
  
  

  private _compactMode = false;
  @Input()
  get compactMode() {
    return this._compactMode;
  }
  set compactMode(val) {
    this._compactMode = val;

    if (!this.menu.instance) {
      return;
    }

    if (val) {
      this.menu.instance.collapseAll();
    } else {
      this.menu.instance.expandItem(this._selectedItem);
    }
  }

  constructor(
    private elementRef: ElementRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const userId = this.authService._user?.id_personnel;
    console.log('UserID in nav', userId);

    this.idRole = this.authService._user?.role_personnel;
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    this.selectedItemChanged.emit(event);
  }

  ngAfterViewInit() {
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }
}

@NgModule({
  imports: [DxTreeViewModule],
  declarations: [SideNavigationMenuComponent],
  exports: [SideNavigationMenuComponent],
})
export class SideNavigationMenuModule {}
