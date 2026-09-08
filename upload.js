(function () {
  var form = document.getElementById('uploadForm');
  var info = document.getElementById('uploadInfo');
  var list = document.getElementById('uploadList');

  if (!form || !list) {
    return;
  }

  function formatDate(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '-' : d.toLocaleString();
  }

  function renderFiles(files) {
    list.innerHTML = '';
    var header = document.createElement('tr');
    header.innerHTML =
      '<th style="text-align:center;">Nama File</th>' +
      '<th style="text-align:center;">Waktu Unggah</th>' +
      '<th style="text-align:center;">Aksi</th>';
    list.appendChild(header);

    files.forEach(function (file) {
      var tr = document.createElement('tr');

      var nameTd = document.createElement('td');
      var link = document.createElement('a');
      link.href = '/api/uploads/' + file.key;
      link.target = '_blank';
      link.textContent = file.filename;
      nameTd.appendChild(link);

      var dateTd = document.createElement('td');
      dateTd.style.textAlign = 'center';
      dateTd.textContent = formatDate(file.uploadedAt);

      var actionTd = document.createElement('td');
      actionTd.style.textAlign = 'center';
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.textContent = 'Hapus';
      delBtn.addEventListener('click', function () {
        deleteFile(file.key);
      });
      actionTd.appendChild(delBtn);

      tr.appendChild(nameTd);
      tr.appendChild(dateTd);
      tr.appendChild(actionTd);
      list.appendChild(tr);
    });
  }

  function loadFiles() {
    fetch('/api/uploads')
      .then(function (res) { return res.json(); })
      .then(function (data) { renderFiles(data.files || []); })
      .catch(function () { info.textContent = 'Gagal memuat daftar file.'; });
  }

  function deleteFile(key) {
    fetch('/api/uploads/' + key, { method: 'DELETE' })
      .then(loadFiles)
      .catch(function () { info.textContent = 'Gagal menghapus file.'; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fileInput = document.getElementById('uploadFileInput');
    var file = fileInput.files[0];
    if (!file) {
      return;
    }

    var data = new FormData();
    data.append('file', file);

    info.textContent = 'Mengunggah...';
    fetch('/api/upload', { method: 'POST', body: data })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Upload gagal');
        }
        return res.json();
      })
      .then(function () {
        info.textContent = 'File berhasil diunggah.';
        fileInput.value = '';
        loadFiles();
      })
      .catch(function () {
        info.textContent = 'Gagal mengunggah file.';
      });
  });

  loadFiles();
})();
