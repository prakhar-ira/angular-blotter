import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  takeWhile,
  finalize,
  debounceTime,
  map,
  distinctUntilChanged
} from 'rxjs/operators';
import { Subject, fromEvent } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('searchCcy') searchCcyElement: ElementRef;
  @ViewChild('searchStatus') searchStatusElement: ElementRef;
  rows: any[] = [];
  dummyRows: any[] = [];
  columns: any[] = [];
  type = true;
  private alive = true;

  constructor(private http: HttpClient) {}

  getColumn(): void {
    this.http
      .get('https://restsimulator.intuhire.com/blotter_columns')
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        (data: any) => {
          this.columns = data;
          console.log(data);
        },
        res => {
          console.log(res);
        }
      );
  }

  getOrder(): void {
    this.http
      .get('https://restsimulator.intuhire.com/orders')
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        (data: any) => {
          this.rows = data;
          this.dummyRows = [...this.rows];
          console.log(data);
        },
        res => {
          console.log(res);
        }
      );
  }

  searchCcyPair(): void {
    fromEvent(this.searchCcyElement.nativeElement, 'keyup')
      .pipe(
        map((ev: any) => ev.target.value),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query: any) => {
        this.dummyRows = this.rows.filter(row => row.CcyPair.includes(query));
      });
  }

  searchStatus(): void {
    fromEvent(this.searchStatusElement.nativeElement, 'keyup')
      .pipe(
        map((ev: any) => ev.target.value),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query: any) => {
        this.dummyRows = this.rows.filter(row => row.Status.includes(query));
      });
  }

  sortTable(): void {
    if (this.type) {
      this.dummyRows.sort((a, b) => {
        return <any>new Date(a.Time) - <any>new Date(b.Time);
      });
      this.type = false;
    } else {
      console.log('hi');
      this.dummyRows.sort((a, b) => {
        return <any>new Date(b.Time) - <any>new Date(a.Time);
      });
      this.type = true;
    }
  }

  ngOnInit() {
    this.searchStatus();
    this.searchCcyPair();
    this.getColumn();
    this.getOrder();
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
