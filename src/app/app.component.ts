import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  standalone: true,
  imports: [ButtonModule, FileUploadModule, ToastModule, FormsModule, HttpClientModule,
    CheckboxModule
  ],
  selector: 'cccsvtoodoo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService, HttpClient],
})
export class AppComponent {
  title = 'cccsvtoodoo';
  convertedcsv: string[] = [];
  saldo = false;

  constructor(private domSanitizer: DomSanitizer) { }

  onUpload(event: any) {
    console.log(event);
  }

  uploadBackground($event: any) {
    console.log($event);
    const file = $event.files ? $event.files[0] : $event.target.files[0];

    const reader = new FileReader();
    if (!file.type.match('.csv')) {
      alert('invalid format');
      return;
    }

    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e: any) {
    const reader = e.target;
    //console.log(reader.result);

    const csv = atob(reader.result.split(',')[1]);
    console.log(csv);

    this.convertedcsv =
      this.convertCSVTOOdooCSV(csv);
    this.downloadString('converted.csv', this.convertedcsv.join(''));
  }

  convColumntoFloat(acsv: string) {
    try {
      let x = acsv.replace(/"/g, '');
      if (x.indexOf('.') >= 0) {
        x = x.split('.').join('');
      }
      if (x.indexOf(',') >= 0) {
        x = x.replace(/,/g, '.');
      }
      console.log(acsv, x);
      return parseFloat(x).toFixed(2);
    } catch (error) {
      console.log('error', error);
      console.log(acsv);
      return '0';
    }
  }

  sortByDate(alist: string[]) {
    return alist.sort((a, b) => {
      const aa = a.split('","');
      const bb = b.split('","');
      const x = new Date(aa[3] + ' ' + aa[4].replace('"', ''));
      const y = new Date(bb[3] + ' ' + bb[4].replace('"', ''));
      return x > y ? 1 : -1;
    });
  }


  convertCSVTOOdooCSV(acsv: string) {
    const lines = acsv.split('\n');
    let result = [];
    let startline = 0;
    let sep = ';';
    if (lines[startline].indexOf('"SEP=,"') >= 0) {
      startline += 1;
      sep = ',';
    }
    if (lines[startline].indexOf('HAENLDERNAME-MERCHANT_NAME') >= 0) {
      startline += 1;
    }

    let strings = '';
    if (lines[startline].indexOf('"') === 0) {
      strings = '"'
    }


    for (let i = startline; i < lines.length; i++) {
      const line = lines[i];
      if (line) {

        const columns = line.split(strings + sep + strings);

        try {
          columns[1] = this.convColumntoFloat(columns[1]);
          // columns[9] = this.convColumntoFloat(columns[9]);
          //          columns[11] = this.convColumntoFloat(columns[11]);
          //          columns[13] = this.convColumntoFloat(columns[13]);
        } catch (error) {
          console.log('error', error);
          console.log(i, line);
          throw error;
        }
        const z = columns[7].split('.');



        columns[3] = z[2] + '-' + z[1] + '-' + z[0] + ' ';
        columns[columns.length - 1] = '"\n';
        result.push('"' + columns.join('","'));
      }
    }

    result = this.sortByDate(result);

    if (this.saldo) {
      let lastsaldo1 = -1;
      let lastsaldo2 = -1;

      for (let i = result.length - 1; i > 0; i--) {
        const line = result[i];
        if (line) {
          const columns = line.split('","');
          if (columns[0].indexOf('SALDOUEBERTRAG') >= 0) {
            if (lastsaldo1 === -1) {
              lastsaldo1 = i;
            } else {
              if (lastsaldo2 === -1) {
                lastsaldo2 = i;
              }
            }
          }
        }
      }

      lastsaldo2 = Math.max(0, lastsaldo2);
      const r2: string[] = ['"HAENLDERNAME-MERCHANT_NAME","BETRAG-AMOUNT","WAEHRUNG-CURRENCY","DATUM-DATE","ZEIT-TIME","BRANCHE-CATEGORY","STATUS-STATUS","BUCHUNGSDATUM-POSTING_DATE","ORT-PLACE","BETRAG_OHNE_GEBUEHREN-AMOUNT_WITHOUT_FEES","WAEHRUNG_OHNE_GEBUEHREN-CURRENCY_WITHOUT_FEES","BETRAG_IN_FREMDWAEHRUNG-FOREIGN_AMOUNT","FREMDWAEHRUNG-FOREIGN_CURRENCY","BEARBEITUNGSENTGELT-FOREIGN_PROCESSING_FEE_AMOUNT","WAEHRUNG_BEARBEITUNGSENTGELT-FOREIGN_PROCESSING_FEE_CURRENCY","BARBEHEBUNGSENTGELT-CASH_WITHDRAWAL_FEE_AMOUNT","WAEHRUNG_BARBEHEBUNGSENTGELT-CASH_WITHDRAWAL_FEE_CURRENCY","KARTENNUMMER-CARD_NUMBER"\n'];

      for (let i = lastsaldo2 + 1; i <= lastsaldo1; i++) {
        r2.push(result[i]);
      }
      result = r2;
    }
    //    result = [lines[1] + '\n', ...result];
    return result;
  }

  downloadString(filename: string, data: string) {
    console.log('downloadString');
    const element = document.createElement('a');
    const file = new Blob([data], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
