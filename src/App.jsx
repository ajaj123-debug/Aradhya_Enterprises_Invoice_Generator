import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const defaultItems = [
  { desc: 'Canteen Food Bill', unit: 1, rate: 58797.0 },
];

function formatCurrency(value) {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

function toWords(num) {
  if (!num && num !== 0) return '';
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const numberToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
    if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
    if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '');
    return numberToWords(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 ? ' ' + numberToWords(n % 10000000) : '');
  };
  return numberToWords(Math.floor(num));
}

export default function App() {
  const [invoice, setInvoice] = useState({
    invoiceNo: 'INV-26-01',
    invoiceDate: '2026-04-20',
    period: 'APR-26',
    customerName: 'SEABIRD MARINE SERVICES PVT LTD',
    customerAddress: 'New R S 127, Behind L&T Gate No 7, Village-Shivrampara, Hazira, Tal Choryasi, Surat, 394510\nGujarat, India',
    gstin: '24AACCS9869C1Z5',
    billTo: 'Canteen Food Bill',
    totalAmount: 58797.0,
    notes: 'Subject to SURAT Jurisdiction\nCertified that the particulars given above are correct.\nThank you for your business. We appreciate your business and look forward to working with you.',
    bank: {
      name: 'Central Bank of India',
      holder: 'PINTU KUMAR OJHA',
      account: '3570665340',
      ifsc: 'CBIN0280026',
      branch: 'Sahebganj Branch (00026), Bihar - 813125',
    },
    items: defaultItems,
    services: [
      { desc: 'TOTAL TEA', qty: 5249, rate: 9.0 },
      { desc: 'OFFICE TEA', qty: 315, rate: 12.0 },
      { desc: 'LUNCH', qty: 3, rate: 70.0 },
      { desc: 'COLD DRINK', qty: 66, rate: 15.0 },
      { desc: 'BREAKFST', qty: 33, rate: 32.0 },
      { desc: 'OFFICIAL LUNCH', qty: 46, rate: 120.0 },
    ],
  });
  const invoiceRef = useRef(null);

  const itemTotal = useMemo(() => invoice.items.reduce((sum, item) => sum + item.unit * item.rate, 0), [invoice.items]);
  const serviceTotal = useMemo(() => invoice.services.reduce((sum, item) => sum + item.qty * item.rate, 0), [invoice.services]);
  const totalAmount = useMemo(() => serviceTotal || itemTotal, [serviceTotal, itemTotal]);

  const updateField = (field, value) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setInvoice((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: field === 'desc' ? value : Number(value) };
      return { ...prev, items };
    });
  };

  const updateService = (index, field, value) => {
    setInvoice((prev) => {
      const services = [...prev.services];
      services[index] = { ...services[index], [field]: field === 'desc' ? value : Number(value) };
      return { ...prev, services };
    });
  };

  const downloadPdf = async () => {
    if (!invoiceRef.current) return;
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${invoice.invoiceNo}.pdf`);
  };

  return (
    <div className="page-shell">
      <header className="app-header">
        <div>
          <h1>Aaradhya Enterprise</h1>
          <p>Industrial & Commercial Canteen Services</p>
        </div>
      </header>

      <main className="app-grid">
        <section className="form-card">
          <h2>Invoice Details</h2>
          <div className="field-group">
            <label>Invoice No</label>
            <input value={invoice.invoiceNo} onChange={(e) => updateField('invoiceNo', e.target.value)} />
            <label>Invoice Date</label>
            <input type="date" value={invoice.invoiceDate} onChange={(e) => updateField('invoiceDate', e.target.value)} />
            <label>Period</label>
            <input value={invoice.period} onChange={(e) => updateField('period', e.target.value)} />
            <label>Customer Name</label>
            <input value={invoice.customerName} onChange={(e) => updateField('customerName', e.target.value)} />
            <label>Customer Address</label>
            <textarea value={invoice.customerAddress} onChange={(e) => updateField('customerAddress', e.target.value)} rows={4} />
            <label>GSTIN</label>
            <input value={invoice.gstin} onChange={(e) => updateField('gstin', e.target.value)} />
          </div>

          <h2>Invoice Items</h2>
          {invoice.items.map((item, index) => (
            <div key={index} className="line-item-row">
              <input value={item.desc} onChange={(e) => updateItem(index, 'desc', e.target.value)} />
              <input type="number" value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} min="0" />
              <input type="number" value={item.rate} onChange={(e) => updateItem(index, 'rate', e.target.value)} min="0" />
            </div>
          ))}

          <h2>Services in Detail</h2>
          {invoice.services.map((service, index) => (
            <div key={index} className="line-item-row service-row">
              <input value={service.desc} onChange={(e) => updateService(index, 'desc', e.target.value)} />
              <input type="number" value={service.qty} onChange={(e) => updateService(index, 'qty', e.target.value)} min="0" />
              <input type="number" value={service.rate} onChange={(e) => updateService(index, 'rate', e.target.value)} min="0" step="0.01" />
              <div className="computed-amount">{formatCurrency(service.qty * service.rate)}</div>
            </div>
          ))}
          <div className="service-summary">
            <span>Service Total</span>
            <strong>{formatCurrency(serviceTotal)}</strong>
          </div>

          <h2>Bank Details</h2>
          <div className="field-group">
            <label>Account Holder Name</label>
            <input value={invoice.bank.holder} readOnly />
            <label>Bank Name</label>
            <input value={invoice.bank.name} readOnly />
            <label>Account Number</label>
            <input value={invoice.bank.account} readOnly />
            <label>IFSC Code</label>
            <input value={invoice.bank.ifsc} readOnly />
            <label>Branch</label>
            <input value={invoice.bank.branch} readOnly />
          </div>

          <button className="download-button" onClick={downloadPdf}>Download Invoice PDF</button>
        </section>

        <section className="preview-card">
          <div className="invoice-preview" ref={invoiceRef}>
            <div className="invoice-header">
              <div>
                <h1>Aaradhya Enterprise</h1>
                <p>Industrial & Commercial Canteen Services</p>
              </div>
              <div className="invoice-meta">
                <div><strong>Invoice No</strong> {invoice.invoiceNo}</div>
                <div><strong>Invoice Date</strong> {invoice.invoiceDate}</div>
                <div><strong>Period</strong> {invoice.period}</div>
              </div>
            </div>

            <div className="invoice-top-row">
              <div className="bill-to">
                <strong>Invoice To:</strong>
                <div>{invoice.customerName}</div>
                <div className="address-block">{invoice.customerAddress.split('\n').map((line, idx) => (<div key={idx}>{line}</div>))}</div>
                <div><strong>GSTIN</strong> {invoice.gstin}</div>
              </div>
              <div className="summary-box">
                <div><strong>Total Amount</strong></div>
                <div className="summary-amount">{formatCurrency(totalAmount)}</div>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Particulars</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.desc}</td>
                    <td>{item.unit}</td>
                    <td>{formatCurrency(item.rate)}</td>
                    <td>{formatCurrency(item.unit * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4">Total Amount</td>
                  <td>{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="in-words">
              <strong>In words:</strong> {toWords(totalAmount)} rupees only.
            </div>

            <div className="notes-card">
              <strong>Customer Notes</strong>
              <pre>{invoice.notes}</pre>
            </div>

            <div className="bank-details">
              <div><strong>Proprietor Bank Details</strong></div>
              <div>Account Holder Name: {invoice.bank.holder}</div>
              <div>Bank Name: {invoice.bank.name}</div>
              <div>Account Number: {invoice.bank.account}</div>
              <div>IFSC Code: {invoice.bank.ifsc}</div>
              <div>Branch: {invoice.bank.branch}</div>
            </div>

            <div className="services-detail">
              <h3>Services in Detail</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Particulars</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.services.map((service, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{service.desc}</td>
                      <td>{service.qty}</td>
                      <td>{formatCurrency(service.rate)}</td>
                      <td>{formatCurrency(service.qty * service.rate)}</td>
                    </tr>
                  ))}
                </tbody>
                    <tfoot>
                  <tr>
                    <td colSpan="4">TOTAL AMOUNT</td>
                    <td>{formatCurrency(serviceTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
