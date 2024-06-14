import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [ButtonModule, FileUploadModule, ToastModule, FormsModule, HttpClientModule],
  selector: 'cccsvtoodoo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService, HttpClient],
})
export class AppComponent {
  title = 'cccsvtoodoo';
  convertedcsv: string[] = [];
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
    let x = acsv.replace(/"/g, '');
    x = x.replace(/,/g, '.');
    return parseFloat(x).toFixed(2);
  }

  sortByDate(alist: string[]) {
    return alist.sort((a, b) => {
      const x = new Date(a.split('","')[3]);
      const y = new Date(b.split('","')[3]);
      return x > y ? 1 : -1;
    });
  }


  convertCSVTOOdooCSV(acsv: string) {
    const lines = acsv.split('\n');
    let result = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        const columns = line.split('","');

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
        const z = columns[3].split('.');



        columns[3] = z[2] + '-' + z[1] + '-' + z[0];
        result.push(columns.join('","') + '\n');
      }
    }

    result = [lines[1] + '\n', ...this.sortByDate(result)];
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
