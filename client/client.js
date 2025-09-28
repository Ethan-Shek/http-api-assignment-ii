const output = document.getElementById('output');

const handleResponse = async (response, parse = true) => {
  const statusLine = `Status: ${response.status}`;
  let bodyText = '';

  if (parse && response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    bodyText = `Response: ${JSON.stringify(data, null, 2)}`;
  }

  output.textContent = `${statusLine}\n${bodyText}`;
};

document.getElementById('getUsersGet').onclick = () => {
  fetch('/getUsers')
    .then(res => handleResponse(res, true));
};

document.getElementById('getUsersHead').onclick = () => {
  fetch('/getUsers', { method: 'HEAD' })
    .then(res => handleResponse(res, false));
};

document.getElementById('notRealGet').onclick = () => {
  fetch('/notReal')
    .then(res => handleResponse(res, true));
};

document.getElementById('notRealHead').onclick = () => {
  fetch('/notReal', { method: 'HEAD' })
    .then(res => handleResponse(res, false));
};

document.getElementById('addUserBtn').onclick = () => {
  const name = document.getElementById('nameField').value;
  const age = document.getElementById('ageField').value;

  fetch('/addUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, age }),
  }).then(res => {
    // Only parse body if not 204 (No Content)
    handleResponse(res, res.status !== 204);
  });
};
