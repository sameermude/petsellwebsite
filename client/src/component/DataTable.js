import React, { useState } from 'react';
import { useTable, usePagination } from 'react-table';


const DataTable = ({ columns, data }) => {
  const [gotoPageValue, setGotoPageValue] = useState('');

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex },
    previousPage,
    nextPage,
    gotoPage,
    canPreviousPage,
    canNextPage,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination
  );

  const rowCount = data.length;
  const pageCount = Math.ceil(rowCount / 10);

  const handleGotoPage = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(gotoPageValue, 10);
    if (pageNumber && pageNumber > 0 && pageNumber <= pageCount) {
      gotoPage(pageNumber - 1);
    }
  };

  return (
    <div>
      <table {...getTableProps()} className="my-table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    textAlign: 'center',
                    borderColor: 'black',
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    borderRight: '1px solid black',
                    borderLeft: '1px solid black',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>{column.render('Header')}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                style={{
                  height: 'auto',
                  lineHeight: '20px',
                }}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    style={{
                      textAlign: cell.column.textAlign || 'center',
                      borderBottom: '1px solid #000',
                      borderRight: '1px solid #000',
                    }}
                  >
                    {typeof cell.value === 'string' && cell.value.includes('\n') ? (
                      cell.value.split('\n').map((line, index) => (
                        <div key={index}>{line}</div>
                      ))
                    ) : (
                      cell.render('Cell')
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* <div className="pagination">
        <button className="custom-button" type="submit" onClick={() => gotoPage(0)}>
          First Page
        </button>
        <button className="custom-button" type="submit" onClick={previousPage} disabled={!canPreviousPage}>
          Previous
        </button>
        <span style={{ marginRight: '15px' }}>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageCount}
          </strong>{' '}
        </span>

        <button className="custom-button" type="submit" onClick={nextPage} disabled={!canNextPage}>
          Next
        </button>
        <button className="custom-button" type="submit" onClick={() => gotoPage(pageCount - 1)}>
          Last Page
        </button>
        <form onSubmit={handleGotoPage}>
          <input
            type="number"
            min="1"
            max={pageCount}
            value={gotoPageValue}
            onChange={(e) => setGotoPageValue(e.target.value)}
          />
          <button className="custom-button" type="submit">
            Go
          </button>
        </form>
      </div> */}
    </div>
  );
};

export default DataTable;
